const createTokenUser = (user) => {
  return {
    name: user.name,
    userId: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    bio: user.bio,
    profilePicture: user.profilePicture,
  };
};

export default createTokenUser;
