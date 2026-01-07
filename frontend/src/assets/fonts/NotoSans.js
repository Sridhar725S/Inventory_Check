(function (jsPDFAPI) {
  jsPDFAPI.addFileToVFS("NotoSans-Regular.ttf", "<PASTE_BASE64_REGULAR>");
  jsPDFAPI.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");

  jsPDFAPI.addFileToVFS("NotoSans-Bold.ttf", "<PASTE_BASE64_BOLD>");
  jsPDFAPI.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
})(jsPDF.API);
