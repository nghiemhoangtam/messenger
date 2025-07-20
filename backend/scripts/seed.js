/*
  MongoDB Seed Script
  Generates collections with 1k–50k realistic documents using Faker
  Uses environment variables from .env for connection
*/

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const { faker } = require('@faker-js/faker');

/** Helper: safe random count between min and max, ensures max >= min */
function randCount(min, max) {
  if (max < min) max = min;
  return faker.number.int({ min, max });
}

async function seed() {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
  const uri = `mongodb://${DB_USERNAME}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Drop existing
    for (const { name } of await db.listCollections().toArray()) {
      await db
        .collection(name)
        .drop()
        .catch(() => {});
    }

    // USERS 1k–50k
    const userCount = randCount(1000, 50000);
    const users = Array.from({ length: userCount }, () => ({
      _id: new ObjectId(),
      email: faker.internet.email().toLowerCase(),
      display_name: faker.person.fullName(),
      password: faker.internet.password(12),
      avatar: faker.image.avatar(),
      is_active: faker.datatype.boolean(),
      status: faker.helpers.arrayElement(['online', 'offline', 'away']),
      last_seen: faker.date.recent({ days: 30 }),
      created_at: faker.date.past({ years: 2 }),
      updated_at: faker.date.recent({ days: 30 }),
    }));
    await db.collection('users').insertMany(users);

    // SOCIAL ACCOUNTS 1k–50k
    const saCount = randCount(1000, 50000);
    const socials = Array.from({ length: saCount }, () => {
      const u = faker.helpers.arrayElement(users);
      return {
        _id: new ObjectId(),
        user_id: u._id,
        provider: faker.helpers.arrayElement([
          'google',
          'facebook',
          'twitter',
          'github',
          'linkedin',
        ]),
        provider_id: faker.string.uuid(),
        access_token: faker.string.alphanumeric(64),
        refresh_token: faker.string.alphanumeric(64),
        created_at: faker.date.between({ from: u.created_at, to: new Date() }),
      };
    });
    await db.collection('social_accounts').insertMany(socials);

    // TOKENS 1k–50k
    const tkCount = randCount(1000, 50000);
    const tokens = Array.from({ length: tkCount }, () => {
      const u = faker.helpers.arrayElement(users);
      const created = faker.date.recent({ days: 60 });
      return {
        _id: new ObjectId(),
        user_id: u._id,
        access_token: faker.string.alphanumeric(80),
        refresh_token: faker.string.alphanumeric(80),
        created_at: created,
        revoked_at: faker.datatype.boolean()
          ? faker.date.between({ from: created, to: new Date() })
          : null,
        user_agent: faker.internet.userAgent(),
        ip_address: faker.internet.ip(),
      };
    });
    await db.collection('tokens').insertMany(tokens);

    // PASSWORD RESET TOKENS 1k–50k
    const prCount = randCount(1000, 50000);
    const pwResets = Array.from({ length: prCount }, () => {
      const u = faker.helpers.arrayElement(users);
      const created = faker.date.recent({ days: 30 });
      return {
        _id: new ObjectId(),
        user_id: u._id,
        token: faker.string.alphanumeric(40),
        expired_at: faker.date.soon({ days: 7, refDate: created }),
        is_used: faker.datatype.boolean(),
        created_at: created,
      };
    });
    await db.collection('password_reset_tokens').insertMany(pwResets);

    // EMAIL VERIFICATION TOKENS equal to users
    const emailVerifs = users.map((u) => ({
      _id: new ObjectId(),
      user_id: u._id,
      token: faker.string.alphanumeric(40),
      expires_at: faker.date.soon({ days: 3, refDate: u.created_at }),
      is_used: faker.datatype.boolean(),
      created_at: faker.date.between({ from: u.created_at, to: new Date() }),
    }));
    await db.collection('email_verification_tokens').insertMany(emailVerifs);

    // ROOMS 1k–50k
    const roomCount = randCount(1000, 50000);
    const rooms = Array.from({ length: roomCount }, () => ({
      _id: new ObjectId(),
      name: faker.lorem.words(faker.number.int({ min: 1, max: 3 })),
      type: faker.helpers.arrayElement(['private', 'group']),
      is_active: faker.datatype.boolean(),
      created_at: faker.date.past({ years: 1 }),
      created_by_id: faker.helpers.arrayElement(users)._id,
    }));
    await db.collection('rooms').insertMany(rooms);

    // ROOM MEMBERS 2*rooms to 4*rooms capped at 50000
    const rmMin = roomCount * 2;
    const rmMax = Math.min(roomCount * 4, 50000);
    const rmCount = randCount(rmMin, rmMax);
    const members = Array.from({ length: rmCount }, () => {
      const r = faker.helpers.arrayElement(rooms);
      const u = faker.helpers.arrayElement(users);
      return {
        _id: new ObjectId(),
        room_id: r._id,
        user_id: u._id,
        joined_at: faker.date.between({ from: r.created_at, to: new Date() }),
        role: faker.helpers.arrayElement(['admin', 'member']),
      };
    });
    await db.collection('room_members').insertMany(members);

    // MESSAGES 1k–50k
    const msgCount = randCount(1000, 50000);
    const messages = [];
    for (let i = 0; i < msgCount; i++) {
      const r = faker.helpers.arrayElement(rooms);
      const senders = members
        .filter((m) => m.room_id.equals(r._id))
        .map((m) => m.user_id);
      const senderId = senders.length
        ? faker.helpers.arrayElement(senders)
        : faker.helpers.arrayElement(users)._id;
      messages.push({
        _id: new ObjectId(),
        room_id: r._id,
        sender_id: senderId,
        type: faker.helpers.arrayElement([
          'text',
          'image',
          'file',
          'video',
          'voice',
          'sticker',
          'emoji',
        ]),
        content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        metadata: {},
        created_at: faker.date.recent({ days: 7 }),
        updated_at: faker.date.recent({ days: 1 }),
        is_deleted: faker.datatype.boolean(),
      });
    }
    await db.collection('messages').insertMany(messages);

    // MESSAGE REACTIONS 1k–min(msgCount*2,50000)
    const reactCount = randCount(1000, Math.min(msgCount * 2, 50000));
    const reactions = Array.from({ length: reactCount }, () => {
      const m = faker.helpers.arrayElement(messages);
      return {
        _id: new ObjectId(),
        message_id: m._id,
        sender_id: faker.helpers.arrayElement(users)._id,
        emoji: faker.helpers.arrayElement(['👍', '❤️', '😂', '🎉']),
        reacted_at: faker.date.between({ from: m.created_at, to: new Date() }),
      };
    });
    await db.collection('message_reactions').insertMany(reactions);

    // FILES 1k–min(msgCount,50000)
    const fileCount = randCount(1000, Math.min(msgCount, 50000));
    const files = Array.from({ length: fileCount }, () => {
      const m = faker.helpers.arrayElement(messages);
      return {
        _id: new ObjectId(),
        uploader_id: m.sender_id,
        message_id: m._id,
        file_url: faker.internet.url(),
        file_type: faker.helpers.arrayElement([
          'image/png',
          'application/pdf',
          'video/mp4',
        ]),
        file_size: faker.number.int({ min: 1000, max: 5000000 }),
        uploaded_at: faker.date.between({ from: m.created_at, to: new Date() }),
      };
    });
    await db.collection('files').insertMany(files);

    // CALLS 1k–50k
    const callCount = randCount(1000, 50000);
    const calls = Array.from({ length: callCount }, () => {
      const r = faker.helpers.arrayElement(rooms);
      const start = faker.date.recent({ days: 5 });
      const end = new Date(
        start.getTime() + faker.number.int({ min: 300000, max: 7200000 }),
      );
      return {
        _id: new ObjectId(),
        room_id: r._id,
        started_by_id: faker.helpers.arrayElement(users)._id,
        started_at: start,
        ended_at: end,
        call_type: faker.helpers.arrayElement([
          'audio',
          'video',
          'screen_share',
        ]),
      };
    });
    await db.collection('calls').insertMany(calls);

    // CALL PARTICIPANTS 2*callCount–min(callCount*5,50000)
    const cpMin = callCount * 2;
    const cpMax = Math.min(callCount * 5, 50000);
    const cpCount = randCount(cpMin, cpMax);
    const participants = Array.from({ length: cpCount }, () => {
      const c = faker.helpers.arrayElement(calls);
      return {
        _id: new ObjectId(),
        call_id: c._id,
        user_id: faker.helpers.arrayElement(users)._id,
        joined_at: faker.date.between({ from: c.started_at, to: c.ended_at }),
        left_at: faker.date.between({ from: c.started_at, to: c.ended_at }),
        call_type: faker.helpers.arrayElement(['audio', 'video']),
      };
    });
    await db.collection('call_participants').insertMany(participants);

    // USER SETTINGS equal users
    const settings = users.map((u) => ({
      _id: new ObjectId(),
      user_id: u._id,
      dark_mode: faker.datatype.boolean(),
      language: faker.helpers.arrayElement(['vi', 'en']),
      notification_enabled: faker.datatype.boolean(),
    }));
    await db.collection('user_settings').insertMany(settings);

    // NOTIFICATIONS 1k–50k
    const notifCount = randCount(1000, 50000);
    const notifications = Array.from({ length: notifCount }, () => {
      const u = faker.helpers.arrayElement(users);
      return {
        _id: new ObjectId(),
        user_id: u._id,
        sender_id: faker.helpers.arrayElement(users)._id,
        type: faker.helpers.arrayElement([
          'message',
          'group_invite',
          'call',
          'reaction',
        ]),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph(),
        is_read: faker.datatype.boolean(),
        metadata: {},
        created_at: faker.date.recent({ days: 7 }),
      };
    });
    await db.collection('notifications').insertMany(notifications);

    // USER RELATIONSHIPS 1k–50k
    const relCount = randCount(1000, 50000);
    const relationships = Array.from({ length: relCount }, () => {
      const s = faker.helpers.arrayElement(users);
      const r = faker.helpers.arrayElement(users);
      return {
        _id: new ObjectId(),
        sender_id: s._id,
        receiver_id: r._id,
        status: faker.helpers.arrayElement([
          'pending',
          'accepted',
          'blocked',
          'rejected',
          'removed',
        ]),
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      };
    });
    await db.collection('user_relationships').insertMany(relationships);

    // BLOCK LISTS 1k–50k
    const blCount = randCount(1000, 50000);
    const blocks = Array.from({ length: blCount }, () => {
      const u = faker.helpers.arrayElement(users);
      const b = faker.helpers.arrayElement(users);
      return {
        _id: new ObjectId(),
        user_id: u._id,
        blocked_user_id: b._id,
        created_at: faker.date.recent({ days: 30 }),
      };
    });
    await db.collection('block_lists').insertMany(blocks);

    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.close();
  }
}

seed();
