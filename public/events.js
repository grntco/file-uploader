export function initEvents() {
  const show = (el) => el?.classList.remove("hidden");
  const hide = (el) => el?.classList.add("hidden");

  // UPLOAD FILE FORM
  const addFileBtn = document.getElementById("add-file-btn");
  const uploadCancelBtn = document.getElementById("upload-cancel-btn");
  const uploadInput = document.getElementById("upload-input");
  const uploadForm = document.getElementById("upload-form");
  const uploadLabel = document.getElementById("upload-label");
  const uploadSubmitBtn = document.getElementById("upload-submit-btn");

  if (addFileBtn && uploadForm) {
    addFileBtn.addEventListener("click", () => show(uploadForm));
  }

  if (uploadCancelBtn && uploadForm) {
    uploadCancelBtn.addEventListener("click", () => hide(uploadForm));
  }

  if (uploadInput && uploadLabel && uploadSubmitBtn) {
    uploadInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      const msg =
        files.length === 1
          ? `1 file (${formatBytes(totalSize)}) selected.`
          : `${files.length} files (${formatBytes(totalSize)}) selected.`;

      uploadLabel.classList.add("green");
      uploadLabel.querySelector("h2").textContent =
        msg + " Click 'upload' to finish uploading.";
      show(uploadSubmitBtn);
    });
  }

  // EDIT FILE FORM
  const editFileBtn = document.getElementById("edit-file-btn");
  const editFileCancelBtn = document.getElementById("edit-file-cancel-btn");
  const editFileForm = document.getElementById("edit-file-form");
  const fileInfo = document.getElementById("single-file-info");

  if (editFileBtn && editFileForm && fileInfo) {
    editFileBtn.addEventListener("click", () => {
      show(editFileForm);
      hide(fileInfo);
    });
  }

  if (editFileCancelBtn && editFileForm && fileInfo) {
    editFileCancelBtn.addEventListener("click", () => {
      hide(editFileForm);
      show(fileInfo);
    });
  }

  // CREATE FOLDER FORM
  const addFolderBtn = document.getElementById("add-folder-btn");
  const newFolderForm = document.querySelector(".new-folder-form-container");
  const newFolderFormCancelBtn = document.getElementById(
    "new-folder-cancel-btn"
  );
  const newFolderFormSubmitBtn = document.getElementById(
    "new-folder-submit-btn"
  );

  if (addFolderBtn && newFolderForm) {
    addFolderBtn.addEventListener("click", () => show(newFolderForm));
  }

  if (newFolderFormCancelBtn && newFolderForm) {
    newFolderFormCancelBtn.addEventListener("click", () => hide(newFolderForm));
  }

  // EDIT FOLDER FORM
  const editFolderBtn = document.getElementById("edit-folder-btn");
  const editFolderCancelBtn = document.getElementById("edit-folder-cancel-btn");
  const editFolderForm = document.getElementById("edit-folder-form");
  const tableHeading = document.getElementById("table-heading");

  if (editFolderBtn && editFolderForm && tableHeading) {
    editFolderBtn.addEventListener("click", () => {
      show(editFolderForm);
      hide(tableHeading);
    });
  }

  if (editFolderCancelBtn && editFolderForm && tableHeading) {
    editFolderCancelBtn.addEventListener("click", () => {
      hide(editFolderForm);
      show(tableHeading);
    });
  }
}
