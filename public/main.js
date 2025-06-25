function initEvents() {
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
    const files = e.target.files;

    if (files.length > 0) {
      uploadLabel.classList.add("green");
      const filesCountMsg =
        files.length === 1 ? "1 file added." : `${files.length} files added.`;

      uploadLabel.querySelector("span").textContent =
        filesCountMsg + " Click 'upload' to finish uploading.";

      uploadSubmitBtn.classList.remove("hidden");
      uploadCancelBtn.classList.add("hidden");
    }
  });
}

initEvents();
