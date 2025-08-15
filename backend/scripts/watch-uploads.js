const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'uploads');
const targetDir = path.join(__dirname, '..', 'dist', 'uploads');

// Tạo thư mục target nếu chưa tồn tại
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy file từ source sang target
function copyFile(filename) {
  const sourcePath = path.join(sourceDir, filename);
  const targetPath = path.join(targetDir, filename);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }
}

// Watch thư mục uploads
function watchUploads() {
  fs.watch(sourceDir, (eventType, filename) => {
    if (filename && eventType === 'rename') {
      // File được tạo mới
      setTimeout(() => {
        copyFile(filename);
      }, 100); // Đợi file được write xong
    }
  });
}

// Sync tất cả file hiện tại
function syncAll() {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    if (fs.statSync(sourcePath).isFile()) {
      copyFile(file);
    }
  });
}

// Chạy sync và watch
syncAll();
watchUploads();
