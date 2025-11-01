const imageUrlToPublicId = function (url) {
  console.log("url:", url);
  const parts = url.split("/");

  const filenameWithExtension = parts.pop();
  console.log("filenameWithExtension:", filenameWithExtension);

  return (publicId = `user-task-management/${
    filenameWithExtension.split(".")[0]
  }`);
};

module.exports = { imageUrlToPublicId };
