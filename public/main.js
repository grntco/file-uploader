
function main() {
  const addFileBtn = document.getElementById("add-file-btn");
  const uploadForm = document.getElementById("upload-form");
  const uploadLabel = uploadForm.querySelector("label");
  const uploadSubmitBtn = uploadLabel.querySelector('button[type="submit"]');
  const uploadCancelBtn = uploadLabel.querySelector("button#upload-cancel-btn");
  const uploadInput = uploadForm.querySelector("input");

  addFileBtn.addEventListener("click", () => {
    uploadForm.classList.remove("hidden");
  });

  uploadCancelBtn.addEventListener("click", () => {
    uploadForm.classList.add("hidden");
  });

  console.log(uploadInput);

  uploadInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const totalSize = files.reduce((total, file) => total + file.size, 0);
      const filesCountMsg =
        files.length === 1
          ? `1 file (${formatBytes(totalSize)}) selected .`
          : `${files.length} files (${formatBytes(totalSize)}) selected.`;

      uploadLabel.classList.add("green");
      uploadLabel.querySelector("span").textContent =
        filesCountMsg + " Click 'upload' to finish uploading.";

      uploadSubmitBtn.classList.remove("hidden");
    //   uploadCancelBtn.classList.add("hidden");
    }
  });
}

main();
