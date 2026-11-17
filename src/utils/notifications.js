import "sweetalert2/dist/sweetalert2.min.css";

let sweetAlertPromise;
let toastPromise;

function getSweetAlert() {
  sweetAlertPromise ??= import("sweetalert2").then(({ default: Swal }) => Swal);
  return sweetAlertPromise;
}

function getToast() {
  toastPromise ??= getSweetAlert().then((Swal) =>
    Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
    }),
  );
  return toastPromise;
}

export function showSuccess(message) {
  return getToast().then((toast) =>
    toast.fire({
      icon: "success",
      text: message,
    }),
  );
}

export function showError(message) {
  return getToast().then((toast) =>
    toast.fire({
      icon: "error",
      text: message,
    }),
  );
}

export async function confirmAction({ title, text, confirmText = "Confirm" }) {
  const Swal = await getSweetAlert();
  const result = await Swal.fire({
    icon: "warning",
    titleText: title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
}
