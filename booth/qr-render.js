(function () {
  function shareUrl() {
    var path = window.location.pathname.replace(/index\.html$/, '');
    if (!/\/$/.test(path)) path += '/';
    return window.location.origin + path;
  }

  function drawQr(canvas) {
    var qr = qrcode(0, 'M');
    qr.addData(shareUrl());
    qr.make();

    var size = 88;
    var margin = 8;
    var moduleCount = qr.getModuleCount();
    var cell = (size - margin * 2) / moduleCount;

    canvas.width = size;
    canvas.height = size;

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#102a4c';

    for (var row = 0; row < moduleCount; row++) {
      for (var col = 0; col < moduleCount; col++) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(margin + col * cell, margin + row * cell, cell, cell);
        }
      }
    }
  }

  var canvas = document.getElementById('booth-qr');
  if (!canvas || typeof qrcode !== 'function') return;

  drawQr(canvas);
  canvas.setAttribute('aria-label', 'QR code for ' + shareUrl());
})();
