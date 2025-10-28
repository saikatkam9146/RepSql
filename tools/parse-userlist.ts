import * as fs from 'fs';
import * as path from 'path';

const file = path.resolve(process.cwd(), 'tools', 'sample-userlist.json');
const raw = fs.readFileSync(file, 'utf8');
const parsed = JSON.parse(raw) as any; // avoid importing app TS types at runtime

console.log('Parsed UserList:');
console.log(`Users: ${parsed.Users.length}`);
console.log(`Departments: ${parsed.Departments.length}`);
console.log(`HasUserEditAccess: ${parsed.HasUserEditAccess}`);
if (parsed.Users.length > 0) {
  const u = parsed.Users[0];
  console.log('First user summary:');
  console.log(`  ID: ${u.User.fnUserID}`);
  console.log(`  Name: ${u.User.fcFirstName} ${u.User.fcLastName}`);
  console.log(`  Email: ${u.User.fcUserEmail}`);
  console.log(`  Department: ${u.Department?.fcDepartmentName}`);
  console.log(`  Access: ${u.UserAccess?.fcAccessDescription}`);
  console.log(`  TimeZone: ${u.TimeZoneOffset?.TimeZoneName} (${u.TimeZoneOffset?.TimeZoneCode})`);
}
