import { User } from 'src/modules/users/schemas/user.schema';
import { hashSync } from 'bcrypt';
import { USER_ROLES } from 'src/modules/users/constants';

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T>(arr: T[]) => arr[randomInt(0, arr.length - 1)];

const randomDateOfBirth = () => {
  const year = randomInt(1985, 2005);
  const month = randomInt(0, 11);
  const day = randomInt(1, 28);
  return new Date(year, month, day);
};

const randomPhone = () => '0' + randomInt(300000000, 999999999).toString();

const randomEmailVerified = () => Math.random() < 0.9;

// Extended list of Vietnamese names for generating 300 users
const FIRST_NAMES = [
  'An', 'Anh', 'Bảo', 'Bích', 'Châu', 'Chi', 'Cường', 'Dũng', 'Dương', 'Đạt',
  'Đức', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hoàng', 'Hùng', 'Hương', 'Huy',
  'Khánh', 'Khoa', 'Kiên', 'Kim', 'Lan', 'Linh', 'Long', 'Mai', 'Minh', 'My',
  'Nam', 'Nga', 'Ngân', 'Ngọc', 'Nhân', 'Nhi', 'Như', 'Phong', 'Phúc', 'Phương',
  'Quân', 'Quang', 'Quỳnh', 'Sơn', 'Thanh', 'Thảo', 'Thắng', 'Thiên', 'Thịnh', 'Thủy',
  'Tiến', 'Trang', 'Trinh', 'Trung', 'Tuấn', 'Tùng', 'Uyên', 'Vân', 'Vinh', 'Vy',
];

const LAST_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Cao', 'Đinh', 'Lâm', 'Trịnh',
];

const MIDDLE_NAMES = [
  'Văn', 'Thị', 'Đức', 'Minh', 'Hoàng', 'Quốc', 'Thanh', 'Xuân', 'Hải', 'Ngọc',
  'Anh', 'Thu', 'Kim', 'Hồng', '',
];

const EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

const normalize = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '');

const PASSWORD_HASH = hashSync('123456', 10);

// Generate 300 unique users
const USER_COUNT = 300;
const usedEmails = new Set<string>();

export const USERS_DATA: Partial<User>[] = [];

for (let i = 0; i < USER_COUNT; i++) {
  const lastName = pickOne(LAST_NAMES);
  const middleName = pickOne(MIDDLE_NAMES);
  const firstName = pickOne(FIRST_NAMES);
  const fullName = middleName
    ? `${lastName} ${middleName} ${firstName}`
    : `${lastName} ${firstName}`;

  const baseUsername = normalize(fullName);
  let suffix = randomInt(1, 999);
  let username = `${baseUsername}${suffix}`;
  let email = `${username}@${pickOne(EMAIL_DOMAINS)}`;

  // Ensure unique email
  while (usedEmails.has(email)) {
    suffix = randomInt(1, 9999);
    username = `${baseUsername}${suffix}`;
    email = `${username}@${pickOne(EMAIL_DOMAINS)}`;
  }
  usedEmails.add(email);

  USERS_DATA.push({
    email,
    emailVerified: randomEmailVerified(),
    password: PASSWORD_HASH,
    username,
    fullName,
    phoneNumber: randomPhone(),
    dateOfBirth: randomDateOfBirth(),
  });
}
