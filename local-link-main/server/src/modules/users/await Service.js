await Service.deleteMany({});
await User.deleteMany({ role: 'provider' }); // This line
