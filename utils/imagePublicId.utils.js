const imageUrlToPublicId = (url) => {
  const parts = url.split("/");

  const filenameWithExtension = parts.pop();

  return (publicId = `user-task-management/${
    filenameWithExtension.split(".")[0]
  }`);
};

module.exports = { imageUrlToPublicId };
