const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'uploads');
const targetDir = path.join(__dirname, '..', 'dist', 'uploads');

// Tạo thư mục target nếu chưa tồn tại
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy tất cả file từ source sang target
function syncUploads() {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

// Chạy sync
syncUploads();
