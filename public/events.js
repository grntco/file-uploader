export function initEvents() {
  console.log("events initialized");

  // UPLOAD FILE FORM
  const addFileBtn = document.getElementById("add-file-btn");
  const uploadCancelBtn = document.getElementById("upload-cancel-btn");
  const uploadInput = document.getElementById("upload-input");

  if (addFileBtn || uploadCancelBtn || uploadInput) {
    const uploadForm = document.getElementById("upload-form");
    const uploadLabel = document.getElementById("upload-label");
    const uploadSubmitBtn = document.getElementById("upload-submit-btn");

    addFileBtn.addEventListener("click", () => {
      uploadForm.classList.remove("hidden");
    });

    uploadCancelBtn.addEventListener("click", () => {
      uploadForm.classList.add("hidden");
    });

    uploadInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);

      if (files.length > 0) {
        const totalSize = files.reduce((total, file) => total + file.size, 0);
        const filesCountMsg =
          files.length === 1
            ? `1 file (${formatBytes(totalSize)}) selected .`
            : `${files.length} files (${formatBytes(totalSize)}) selected.`;

        uploadLabel.classList.add("green");
        uploadLabel.querySelector("h2").textContent =
          filesCountMsg + " Click 'upload' to finish uploading.";

        uploadSubmitBtn.classList.remove("hidden");
        //   uploadCancelBtn.classList.add("hidden");
      }
    });
  }

  // EDIT FILE FORM
  const editFileButton = document.getElementById("edit-file-btn");
  const editFileCancelBtn = document.getElementById("edit-file-cancel-btn");

  if (editFileButton || editFileCancelBtn) {
    const editFileForm = document.getElementById("edit-file-form");
    const singleFileInfo = document.getElementById("single-file-info");

    editFileButton.addEventListener("click", () => {
      editFileForm.classList.remove("hidden");
      singleFileInfo.classList.add("hidden");
    });

    editFileCancelBtn.addEventListener("click", (e) => {
      editFileForm.classList.add("hidden");
      singleFileInfo.classList.remove("hidden");
    });
  }
}
