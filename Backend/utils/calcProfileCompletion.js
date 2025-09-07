
export function calcProfileCompletion(user) {

  const profileFields = ["username", "email", "phoneNo", "password", "address", "age"];

  let filledCount = 0;
  profileFields.forEach((field) => {
    if (user[field] !== null && user[field] !== "" && user[field] !== undefined) {
      filledCount++;
    }
  });

  const percentage = Math.round((filledCount / profileFields.length) * 100);
  return percentage;
}
