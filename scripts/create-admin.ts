import 'tsconfig-paths/register';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function runCreateAdmin() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';

  const existing = await userRepo.findOne({ where: { username } });
  if (existing) {
    console.log(`User ${username} already exists (id=${existing.id}).`);
    await AppDataSource.destroy();
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const admin = userRepo.create({
    nom: 'Admin',
    prenom: 'User',
    username,
    password: hashed,
    email,
    sexe: 'M',
    isSupervisor: true,
    isActive: true,
    status: true,
    isSetPassword: true,
  } as Partial<User>);

  const saved = await userRepo.save(admin);
  console.log('Admin user created:', { id: saved.id, username: saved.username, email: saved.email });

  await AppDataSource.destroy();
}

if (require.main === module) runCreateAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
