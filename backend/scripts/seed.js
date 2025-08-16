/*
  MongoDB Seed Script
  Generates collections with 1k–50k realistic documents using Faker
  Uses environment variables from .env for connection
  Enhanced to include comprehensive data for special user
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
    console.log('Seeding users...');
    const userCount = randCount(1000, 50000);
    const specialUser = {
      _id: new ObjectId(),
      email: 'robocon321n@gmail.com',
      display_name: 'Robocon321n',
      password: '12341234',
      avatar: faker.image.avatar(),
      is_active: true,
      status: 'online',
      last_seen: new Date(),
      created_at: faker.date.past({ years: 2 }),
      updated_at: new Date(),
    };
    const users = [specialUser, ...Array.from({ length: userCount }, () => ({
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
    }))];
    console.log('Inserting users...');
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
    
    // Add special user social accounts (multiple providers)
    const specialUserSocials = [
      {
        _id: new ObjectId(),
        user_id: specialUser._id,
        provider: 'google',
        provider_id: faker.string.uuid(),
        access_token: faker.string.alphanumeric(64),
        refresh_token: faker.string.alphanumeric(64),
        created_at: faker.date.between({ from: specialUser.created_at, to: new Date() }),
      },
      {
        _id: new ObjectId(),
        user_id: specialUser._id,
        provider: 'facebook',
        provider_id: faker.string.uuid(),
        access_token: faker.string.alphanumeric(64),
        refresh_token: faker.string.alphanumeric(64),
        created_at: faker.date.between({ from: specialUser.created_at, to: new Date() }),
      },
      {
        _id: new ObjectId(),
        user_id: specialUser._id,
        provider: 'github',
        provider_id: faker.string.uuid(),
        access_token: faker.string.alphanumeric(64),
        refresh_token: faker.string.alphanumeric(64),
        created_at: faker.date.between({ from: specialUser.created_at, to: new Date() }),
      }
    ];
    socials.push(...specialUserSocials);
    
    console.log('Inserting social accounts...');
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
    
    // Add special user tokens (multiple active sessions)
    const specialUserTokens = Array.from({ length: 5 }, () => {
      const created = faker.date.recent({ days: 30 });
      return {
        _id: new ObjectId(),
        user_id: specialUser._id,
        access_token: faker.string.alphanumeric(80),
        refresh_token: faker.string.alphanumeric(80),
        created_at: created,
        revoked_at: faker.datatype.boolean(0.3) ? faker.date.between({ from: created, to: new Date() }) : null,
        user_agent: faker.internet.userAgent(),
        ip_address: faker.internet.ip(),
      };
    });
    tokens.push(...specialUserTokens);
    
    console.log('Inserting tokens...');
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
    
    // Add special user password reset tokens
    const specialUserPwResets = Array.from({ length: 3 }, () => {
      const created = faker.date.recent({ days: 30 });
      return {
        _id: new ObjectId(),
        user_id: specialUser._id,
        token: faker.string.alphanumeric(40),
        expired_at: faker.date.soon({ days: 7, refDate: created }),
        is_used: faker.datatype.boolean(),
        created_at: created,
      };
    });
    pwResets.push(...specialUserPwResets);
    
    console.log('Inserting password reset tokens...');
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
    console.log('Inserting email verification tokens...');
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
      avatar: faker.image.avatar(),
      description: faker.lorem.sentence(),
      max_members: faker.number.int({ min: 50, max: 200 }),
      is_encrypted: faker.datatype.boolean(0.1),
      last_message_at: faker.date.recent({ days: 7 }),
      pinned_message_id: null,
    }));
    
    // Add special user rooms (both private and group)
    const specialUserRooms = [
      {
        _id: new ObjectId(),
        name: 'My Personal Chat',
        type: 'private',
        is_active: true,
        created_at: faker.date.past({ years: 1 }),
        created_by_id: specialUser._id,
        avatar: faker.image.avatar(),
        description: 'Personal chat room',
        max_members: 2,
        is_encrypted: true,
        last_message_at: faker.date.recent({ days: 1 }),
        pinned_message_id: null,
      },
      {
        _id: new ObjectId(),
        name: 'Project Team',
        type: 'group',
        is_active: true,
        created_at: faker.date.past({ years: 1 }),
        created_by_id: specialUser._id,
        avatar: faker.image.avatar(),
        description: 'Team collaboration for project development',
        max_members: 50,
        is_encrypted: false,
        last_message_at: faker.date.recent({ days: 2 }),
        pinned_message_id: null,
      },
      {
        _id: new ObjectId(),
        name: 'Family Group',
        type: 'group',
        is_active: true,
        created_at: faker.date.past({ years: 1 }),
        created_by_id: specialUser._id,
        avatar: faker.image.avatar(),
        description: 'Family group chat',
        max_members: 20,
        is_encrypted: false,
        last_message_at: faker.date.recent({ days: 3 }),
        pinned_message_id: null,
      },
      {
        _id: new ObjectId(),
        name: 'Gaming Squad',
        type: 'group',
        is_active: true,
        created_at: faker.date.past({ years: 1 }),
        created_by_id: specialUser._id,
        avatar: faker.image.avatar(),
        description: 'Gaming community chat',
        max_members: 100,
        is_encrypted: false,
        last_message_at: faker.date.recent({ days: 1 }),
        pinned_message_id: null,
      }
    ];
    rooms.push(...specialUserRooms);
    
    console.log('Inserting rooms...');
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
        nickname: faker.datatype.boolean(0.3) ? faker.person.firstName() : null,
        is_muted: faker.datatype.boolean(0.1),
        last_read_at: faker.date.recent({ days: 7 }),
        typing_until: null,
      };
    });
    
    // Add special user as member in many rooms and as admin in his own rooms
    const otherUsers = users.filter(u => u._id.toString() !== specialUser._id.toString());
    const shuffled = faker.helpers.shuffle(otherUsers);
    
    // Add special user as admin in his own rooms
    specialUserRooms.forEach(room => {
              members.push({
          _id: new ObjectId(),
          room_id: room._id,
          user_id: specialUser._id,
          joined_at: room.created_at,
          role: 'admin',
          nickname: null,
          is_muted: false,
          last_read_at: faker.date.recent({ days: 1 }),
          typing_until: null,
        });
    });
    
    // Add special user as member in many other rooms
    const randomRooms = rooms.filter(r => !specialUserRooms.some(sr => sr._id.toString() === r._id.toString()));
    const roomsForSpecialUser = faker.helpers.shuffle(randomRooms).slice(0, 50);
    roomsForSpecialUser.forEach(room => {
              members.push({
          _id: new ObjectId(),
          room_id: room._id,
          user_id: specialUser._id,
          joined_at: faker.date.between({ from: room.created_at, to: new Date() }),
          role: faker.helpers.arrayElement(['admin', 'member']),
          nickname: faker.datatype.boolean(0.2) ? faker.person.firstName() : null,
          is_muted: faker.datatype.boolean(0.05),
          last_read_at: faker.date.recent({ days: 3 }),
          typing_until: null,
        });
    });
    
    // Add other users to special user's rooms
    specialUserRooms.forEach(room => {
      const roomMembers = shuffled.slice(0, faker.number.int({ min: 5, max: 20 }));
      roomMembers.forEach((user, index) => {
        members.push({
          _id: new ObjectId(),
          room_id: room._id,
          user_id: user._id,
          joined_at: faker.date.between({ from: room.created_at, to: new Date() }),
          role: index === 0 ? 'admin' : 'member',
          nickname: faker.datatype.boolean(0.3) ? faker.person.firstName() : null,
          is_muted: faker.datatype.boolean(0.1),
          last_read_at: faker.date.recent({ days: 5 }),
          typing_until: null,
        });
      });
    });
    
    console.log('Inserting room members...');
    await db.collection('room_members').insertMany(members);

    // MESSAGES 1k–50k
    const msgCount = randCount(1000, 50000);
    const messages = [];
    for (let i = 0; i < msgCount; i++) {
      const r = faker.helpers.arrayElement(rooms);
      const senders = members
        .filter((m) => m.room_id.toString() === r._id.toString())
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
          'emoji',
        ]),
        content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        metadata: {},
        created_at: faker.date.recent({ days: 7 }),
        updated_at: faker.date.recent({ days: 1 }),
        is_deleted: faker.datatype.boolean(),
        reply_to_id: null,
        edited_at: null,
        edited_by: null,
        status: faker.helpers.arrayElement(['sent', 'delivered', 'read']),
        encryption_key: null,
      });
    }
    
    // Add special user messages in his rooms
    const specialUserMessages = [];
    specialUserRooms.forEach(room => {
      const messageCount = faker.number.int({ min: 20, max: 100 });
      for (let i = 0; i < messageCount; i++) {
        const isSpecialUserMessage = faker.datatype.boolean(0.4); // 40% chance it's from special user
        specialUserMessages.push({
          _id: new ObjectId(),
          room_id: room._id,
          sender_id: isSpecialUserMessage ? specialUser._id : faker.helpers.arrayElement(shuffled)._id,
          type: faker.helpers.arrayElement([
            'text',
            'image',
            'file',
            'video',
            'voice',
            'emoji',
          ]),
          content: isSpecialUserMessage ? 
            faker.helpers.arrayElement([
              'Hello everyone! 👋',
              'How is the project going?',
              'Great work team! 🎉',
              'Let\'s meet tomorrow',
              'I\'ve uploaded the latest files',
              'Thanks for your help!',
              'Happy coding! 💻',
              'Meeting at 3 PM today',
              'Don\'t forget the deadline',
              'Awesome presentation! 👏'
            ]) : faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          metadata: {},
          created_at: faker.date.recent({ days: 30 }),
          updated_at: faker.date.recent({ days: 1 }),
          is_deleted: false,
          reply_to_id: null,
          edited_at: null,
          edited_by: null,
          status: faker.helpers.arrayElement(['sent', 'delivered', 'read']),
          encryption_key: null,
        });
      }
    });
    messages.push(...specialUserMessages);
    
    console.log('Inserting messages...');
    await db.collection('messages').insertMany(messages);

    // MESSAGE READS 1k–min(msgCount*5,50000)
    const readCount = randCount(1000, Math.min(msgCount * 5, 50000));
    const messageReads = [];
    for (let i = 0; i < readCount; i++) {
      const m = faker.helpers.arrayElement(messages);
      const reader = faker.helpers.arrayElement(users);
      // Ensure unique (message_id, reader_id) pair
      if (messageReads.some(r => r.message_id.toString() === m._id.toString() && r.reader_id.toString() === reader._id.toString())) continue;
      messageReads.push({
        _id: new ObjectId(),
        message_id: m._id,
        reader_id: reader._id,
        read_at: faker.date.between({ from: m.created_at, to: new Date() })
      });
    }
    
    // Add special user message reads
    const specialUserMessageReads = [];
    messages.forEach(message => {
      if (faker.datatype.boolean(0.7)) { // 70% chance special user read the message
        specialUserMessageReads.push({
          _id: new ObjectId(),
          message_id: message._id,
          reader_id: specialUser._id,
          read_at: faker.date.between({ from: message.created_at, to: new Date() })
        });
      }
    });
    messageReads.push(...specialUserMessageReads);
    
    console.log('Inserting message reads...');
    await db.collection('message_reads').insertMany(messageReads);

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
    
    // Add special user reactions
    const specialUserReactions = [];
    messages.forEach(message => {
      if (faker.datatype.boolean(0.3)) { // 30% chance special user reacted
        specialUserReactions.push({
          _id: new ObjectId(),
          message_id: message._id,
          sender_id: specialUser._id,
          emoji: faker.helpers.arrayElement(['👍', '❤️', '😂', '🎉', '👏', '🔥']),
          reacted_at: faker.date.between({ from: message.created_at, to: new Date() }),
        });
      }
    });
    reactions.push(...specialUserReactions);
    
    console.log('Inserting message reactions...');
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
        original_name: faker.system.fileName(),
        mime_type: faker.helpers.arrayElement([
          'image/png',
          'image/jpeg',
          'application/pdf',
          'video/mp4',
          'audio/mp3',
        ]),
        thumbnail_url: faker.datatype.boolean(0.7) ? faker.internet.url() : null,
        duration: faker.datatype.boolean(0.3) ? faker.number.int({ min: 10, max: 300 }) : null,
        width: faker.datatype.boolean(0.5) ? faker.number.int({ min: 100, max: 1920 }) : null,
        height: faker.datatype.boolean(0.5) ? faker.number.int({ min: 100, max: 1080 }) : null,
        is_processed: faker.datatype.boolean(0.8),
        processing_status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']),
      };
    });
    
    // Add special user files
    const specialUserFiles = [];
    const specialUserMessagesWithFiles = messages.filter(m => m.sender_id.equals(specialUser._id));
    specialUserMessagesWithFiles.forEach(message => {
      if (faker.datatype.boolean(0.2)) { // 20% chance message has file
        specialUserFiles.push({
          _id: new ObjectId(),
          uploader_id: specialUser._id,
          message_id: message._id,
                  file_url: faker.internet.url(),
        file_type: faker.helpers.arrayElement([
          'image/png',
          'application/pdf',
          'video/mp4',
          'application/zip',
          'text/plain',
        ]),
        file_size: faker.number.int({ min: 1000, max: 10000000 }),
        uploaded_at: faker.date.between({ from: message.created_at, to: new Date() }),
        original_name: faker.system.fileName(),
        mime_type: faker.helpers.arrayElement([
          'image/png',
          'image/jpeg',
          'application/pdf',
          'video/mp4',
          'audio/mp3',
          'application/zip',
          'text/plain',
        ]),
        thumbnail_url: faker.datatype.boolean(0.8) ? faker.internet.url() : null,
        duration: faker.datatype.boolean(0.4) ? faker.number.int({ min: 10, max: 600 }) : null,
        width: faker.datatype.boolean(0.6) ? faker.number.int({ min: 100, max: 1920 }) : null,
        height: faker.datatype.boolean(0.6) ? faker.number.int({ min: 100, max: 1080 }) : null,
        is_processed: faker.datatype.boolean(0.9),
        processing_status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']),
        });
      }
    });
    files.push(...specialUserFiles);
    
    console.log('Inserting files...');
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
    
    // Add special user calls
    const specialUserCalls = [];
    specialUserRooms.forEach(room => {
      const callCount = faker.number.int({ min: 5, max: 20 });
      for (let i = 0; i < callCount; i++) {
        const start = faker.date.recent({ days: 30 });
        const end = new Date(
          start.getTime() + faker.number.int({ min: 600000, max: 7200000 }),
        );
        specialUserCalls.push({
          _id: new ObjectId(),
          room_id: room._id,
          started_by_id: faker.datatype.boolean(0.6) ? specialUser._id : faker.helpers.arrayElement(shuffled)._id,
          started_at: start,
          ended_at: end,
          call_type: faker.helpers.arrayElement([
            'audio',
            'video',
            'screen_share',
          ]),
        });
      }
    });
    calls.push(...specialUserCalls);
    
    console.log('Inserting calls...');
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
    
    // Add special user call participants
    const specialUserCallParticipants = [];
    calls.forEach(call => {
      if (faker.datatype.boolean(0.8)) { // 80% chance special user participated
        specialUserCallParticipants.push({
          _id: new ObjectId(),
          call_id: call._id,
          user_id: specialUser._id,
          joined_at: faker.date.between({ from: call.started_at, to: call.ended_at }),
          left_at: faker.date.between({ from: call.started_at, to: call.ended_at }),
          call_type: faker.helpers.arrayElement(['audio', 'video']),
        });
      }
    });
    participants.push(...specialUserCallParticipants);
    
    console.log('Inserting call participants...');
    await db.collection('call_participants').insertMany(participants);

    // USER SETTINGS equal users
    const settings = users.map((u) => ({
      _id: new ObjectId(),
      user_id: u._id,
      dark_mode: faker.datatype.boolean(),
      language: faker.helpers.arrayElement(['vi', 'en']),
      notification_enabled: faker.datatype.boolean(),
    }));
    
    // Update special user settings
    const specialUserSetting = settings.find(s => s.user_id.equals(specialUser._id));
    if (specialUserSetting) {
      specialUserSetting.dark_mode = true;
      specialUserSetting.language = 'en';
      specialUserSetting.notification_enabled = true;
    }
    
    console.log('Inserting user settings...');
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
    
    // Add special user notifications
    const specialUserNotifications = Array.from({ length: 50 }, () => ({
      _id: new ObjectId(),
      user_id: specialUser._id,
      sender_id: faker.helpers.arrayElement(shuffled)._id,
      type: faker.helpers.arrayElement([
        'message',
        'group_invite',
        'call',
        'reaction',
      ]),
      title: faker.helpers.arrayElement([
        'New message from John',
        'Group invitation to Project Team',
        'Missed call from Sarah',
        'Someone reacted to your message',
        'New friend request',
        'Meeting reminder',
        'File shared with you',
        'Voice message received'
      ]),
      body: faker.lorem.paragraph(),
      is_read: faker.datatype.boolean(),
      metadata: {},
      created_at: faker.date.recent({ days: 7 }),
    }));
    notifications.push(...specialUserNotifications);
    
    console.log('Inserting notifications...');
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
    
    // Add comprehensive special user relationships
    const otherUsersForRelationships = users.filter(u => !u._id.equals(specialUser._id));
    const shuffledForRelationships = faker.helpers.shuffle(otherUsersForRelationships);
    
    // Add 200 accepted relationships (100 sent by special user, 100 received)
    for (let i = 0; i < 100; i++) {
      relationships.push({
        _id: new ObjectId(),
        sender_id: specialUser._id,
        receiver_id: shuffledForRelationships[i]._id,
        status: 'accepted',
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
      relationships.push({
        _id: new ObjectId(),
        sender_id: shuffledForRelationships[100 + i]._id,
        receiver_id: specialUser._id,
        status: 'accepted',
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
    }
    
    // Add 50 pending relationships (25 sent by special user, 25 received)
    for (let i = 0; i < 25; i++) {
      relationships.push({
        _id: new ObjectId(),
        sender_id: specialUser._id,
        receiver_id: shuffledForRelationships[200 + i]._id,
        status: 'pending',
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
      relationships.push({
        _id: new ObjectId(),
        sender_id: shuffledForRelationships[225 + i]._id,
        receiver_id: specialUser._id,
        status: 'pending',
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
    }
    
    // Add 20 blocked relationships (10 blocked by special user, 10 blocking special user)
    for (let i = 0; i < 10; i++) {
      relationships.push({
        _id: new ObjectId(),
        sender_id: specialUser._id,
        receiver_id: shuffledForRelationships[250 + i]._id,
        status: 'blocked',
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
      relationships.push({
        _id: new ObjectId(),
        sender_id: shuffledForRelationships[260 + i]._id,
        receiver_id: specialUser._id,
        status: 'blocked',
        created_at: faker.date.past({ years: 1 }),
        updated_at: faker.date.recent({ days: 30 }),
      });
    }
    
    console.log('Inserting user relationships...');
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
    
    // Add special user block list entries
    const specialUserBlocks = Array.from({ length: 15 }, () => ({
      _id: new ObjectId(),
      user_id: specialUser._id,
      blocked_user_id: faker.helpers.arrayElement(shuffled)._id,
      created_at: faker.date.recent({ days: 30 }),
    }));
    blocks.push(...specialUserBlocks);
    
    console.log('Inserting block lists...');
    await db.collection('block_lists').insertMany(blocks);

    // USER PRESENCE equal to users
    console.log('Seeding user presence...');
    const userPresence = users.map((u) => ({
      _id: new ObjectId(),
      user_id: u._id,
      status: faker.helpers.arrayElement(['online', 'offline', 'away', 'busy']),
      last_seen: faker.date.recent({ days: 7 }),
      custom_status: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
      updated_at: faker.date.recent({ days: 1 }),
    }));
    
    // Update special user presence
    const specialUserPresence = userPresence.find(p => p.user_id.equals(specialUser._id));
    if (specialUserPresence) {
      specialUserPresence.status = 'online';
      specialUserPresence.last_seen = new Date();
      specialUserPresence.custom_status = 'Working on the project 💻';
      specialUserPresence.updated_at = new Date();
    }
    
    await db.collection('user_presence').insertMany(userPresence);

    // TYPING INDICATORS 1k–5k
    console.log('Seeding typing indicators...');
    const typingCount = randCount(1000, 5000);
    const typingIndicators = Array.from({ length: typingCount }, () => {
      const r = faker.helpers.arrayElement(rooms);
      const u = faker.helpers.arrayElement(users);
      const started = faker.date.recent({ days: 1 });
      return {
        _id: new ObjectId(),
        room_id: r._id,
        user_id: u._id,
        started_at: started,
        expires_at: new Date(started.getTime() + faker.number.int({ min: 30000, max: 300000 })),
      };
    });
    
    // Add special user typing indicators
    const specialUserTypingIndicators = Array.from({ length: 10 }, () => {
      const r = faker.helpers.arrayElement(specialUserRooms);
      const started = faker.date.recent({ days: 1 });
      return {
        _id: new ObjectId(),
        room_id: r._id,
        user_id: specialUser._id,
        started_at: started,
        expires_at: new Date(started.getTime() + faker.number.int({ min: 30000, max: 300000 })),
      };
    });
    typingIndicators.push(...specialUserTypingIndicators);
    
    await db.collection('typing_indicators').insertMany(typingIndicators);

    // MESSAGE THREADS 1k–10k
    console.log('Seeding message threads...');
    const threadCount = randCount(1000, 10000);
    const messageThreads = Array.from({ length: threadCount }, () => {
      const parentMessage = faker.helpers.arrayElement(messages);
      const rootMessage = faker.helpers.arrayElement(messages);
      return {
        _id: new ObjectId(),
        parent_message_id: parentMessage._id,
        root_message_id: rootMessage._id,
        thread_id: null,
        created_at: faker.date.between({ from: parentMessage.created_at, to: new Date() }),
      };
    });
    
    // Add special user message threads
    const specialUserMessageThreads = Array.from({ length: 20 }, () => {
      const specialUserMessage = faker.helpers.arrayElement(specialUserMessages);
      const otherMessage = faker.helpers.arrayElement(messages);
      return {
        _id: new ObjectId(),
        parent_message_id: specialUserMessage._id,
        root_message_id: otherMessage._id,
        thread_id: null,
        created_at: faker.date.between({ from: specialUserMessage.created_at, to: new Date() }),
      };
    });
    messageThreads.push(...specialUserMessageThreads);
    
    await db.collection('message_threads').insertMany(messageThreads);

    // MESSAGE MENTIONS 1k–10k
    console.log('Seeding message mentions...');
    const mentionCount = randCount(1000, 10000);
    const messageMentions = Array.from({ length: mentionCount }, () => {
      const message = faker.helpers.arrayElement(messages);
      const mentionedUser = faker.helpers.arrayElement(users);
      return {
        _id: new ObjectId(),
        message_id: message._id,
        mentioned_user_id: mentionedUser._id,
        mention_type: faker.helpers.arrayElement(['user', 'role', 'all']),
        created_at: faker.date.between({ from: message.created_at, to: new Date() }),
      };
    });
    
    // Add special user message mentions
    const specialUserMessageMentions = Array.from({ length: 30 }, () => {
      const message = faker.helpers.arrayElement(specialUserMessages);
      const mentionedUser = faker.helpers.arrayElement(shuffled);
      return {
        _id: new ObjectId(),
        message_id: message._id,
        mentioned_user_id: mentionedUser._id,
        mention_type: faker.helpers.arrayElement(['user', 'role', 'all']),
        created_at: faker.date.between({ from: message.created_at, to: new Date() }),
      };
    });
    messageMentions.push(...specialUserMessageMentions);
    
    await db.collection('message_mentions').insertMany(messageMentions);

    // MESSAGE SEARCH INDEX equal to messages
    console.log('Seeding message search index...');
    const messageSearchIndex = messages.map((m) => ({
      _id: new ObjectId(),
      message_id: m._id,
      room_id: m.room_id,
      content_vector: m.content.toLowerCase(),
      created_at: m.created_at,
    }));
    
    await db.collection('message_search_index').insertMany(messageSearchIndex);

    console.log('Seeding complete!');
    console.log(`Special user data summary:`);
    console.log(`- User: ${specialUser.display_name} (${specialUser.email})`);
    console.log(`- Social accounts: ${specialUserSocials.length}`);
    console.log(`- Tokens: ${specialUserTokens.length}`);
    console.log(`- Password reset tokens: ${specialUserPwResets.length}`);
    console.log(`- Rooms created: ${specialUserRooms.length}`);
    console.log(`- Messages: ${specialUserMessages.length}`);
    console.log(`- Message reads: ${specialUserMessageReads.length}`);
    console.log(`- Message reactions: ${specialUserReactions.length}`);
    console.log(`- Files: ${specialUserFiles.length}`);
    console.log(`- Calls: ${specialUserCalls.length}`);
    console.log(`- Call participants: ${specialUserCallParticipants.length}`);
    console.log(`- Notifications: ${specialUserNotifications.length}`);
    console.log(`- Relationships: 270 (200 accepted, 50 pending, 20 blocked)`);
    console.log(`- Blocked users: ${specialUserBlocks.length}`);
    console.log(`- User presence: Online with custom status`);
    console.log(`- Typing indicators: ${specialUserTypingIndicators.length}`);
    console.log(`- Message threads: ${specialUserMessageThreads.length}`);
    console.log(`- Message mentions: ${specialUserMessageMentions.length}`);
    console.log(`- Message search index: ${messageSearchIndex.length} entries`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.close();
  }
}

seed();
