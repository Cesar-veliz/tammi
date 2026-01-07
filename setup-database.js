const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up database for Sistema Oftalmológico...\n');

// Check if .env exists in backend
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Creating .env file from template...');
  const envExamplePath = path.join(__dirname, 'backend', '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please update DATABASE_URL with your PostgreSQL connection string.\n');
  }
}

try {
  console.log('📦 Installing backend dependencies...');
  execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
  
  console.log('\n🗄️  Generating Prisma client...');
  execSync('npm run prisma:generate', { cwd: 'backend', stdio: 'inherit' });
  
  console.log('\n🔄 Running database migrations...');
  execSync('npm run prisma:migrate', { cwd: 'backend', stdio: 'inherit' });
  
  console.log('\n🌱 Seeding database with initial data...');
  execSync('npm run prisma:seed', { cwd: 'backend', stdio: 'inherit' });
  
  console.log('\n📦 Installing frontend dependencies...');
  execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
  
  console.log('\n✅ Database setup completed successfully!');
  console.log('\n🚀 You can now start the development servers:');
  console.log('   Backend:  cd backend && npm run dev');
  console.log('   Frontend: cd frontend && npm run dev');
  console.log('\n👤 Default users:');
  console.log('   Admin:    admin / admin123');
  console.log('   Usuario:  usuario / user123');
  
} catch (error) {
  console.error('\n❌ Error during setup:', error.message);
  console.log('\n🔧 Manual setup steps:');
  console.log('1. Make sure PostgreSQL is running');
  console.log('2. Update DATABASE_URL in backend/.env');
  console.log('3. Run: cd backend && npm install');
  console.log('4. Run: cd backend && npm run prisma:migrate');
  console.log('5. Run: cd backend && npm run prisma:seed');
  console.log('6. Run: cd frontend && npm install');
}