// Referencias a los elementos del DOM usando jQuery
const $status = $('#status');
const $btnQR = $('#btnQR');
const $btnBar = $('#btnBar');
const $btnCerrar = $('#btnCerrar');
const $cameraSelect = $('#cameraSelect');
const $reader = $('#reader');
let html5QrCode = null; // Instancia del lector QR
let cameraId = null; // ID de la cámara seleccionada

// Detección y selección automática de cámaras disponibles
Html5Qrcode.getCameras()
  .then((cameras) => {
    if (cameras.length) {
      // Busca una cámara trasera (back/rear) o selecciona la primera
      let backCam = cameras.find((c) => /back|rear/i.test(c.label));
      cameraId = backCam ? backCam.id : cameras[0].id;

      $status.text(
        `✅ Cámaras detectadas (${cameras.length}). Se seleccionó: ${
          backCam ? backCam.label : cameras[0].label || 'por defecto'
        }`
      );

      // Llena el selector de cámaras
      $cameraSelect.empty().show();
      cameras.forEach((cam, i) => {
        const $opt = $('<option>')
          .val(cam.id)
          .text(cam.label || `Cámara ${i + 1}`);
        if (cam.id === cameraId) $opt.prop('selected', true);
        $cameraSelect.append($opt);
      });

      // Permitir cambio manual
      $cameraSelect.on('change', (e) => {
        cameraId = $(e.target).val();
        $status.text(
          `✅ Cámara seleccionada manualmente: ${$cameraSelect
            .find('option:selected')
            .text()}`
        );
      });

      // Mostrar botones
      $btnQR.show();
      $btnBar.show();
      $btnCerrar.show();
    } else {
      $status.text('❌ No se detectaron cámaras.');
    }
  })
  .catch((err) => {
    $status.text(`❌ Error al obtener cámaras: ${err}`);
  });

// Función para iniciar la lectura
const iniciarLectura = (formato) => {
  if (!cameraId) {
    alert('Selecciona una cámara válida.');
    return;
  }

  // Detener lector previo si existe
  if (html5QrCode?.isScanning) {
    html5QrCode
      .stop()
      .then(() => {
        $reader.hide();
        iniciarLectura(formato); // Reiniciar con nuevo formato
      })
      .catch((err) => {
        $status.text(`❌ Error al detener cámara: ${err}`);
      });
    return;
  }

  html5QrCode = new Html5Qrcode('reader');
  $reader.show();

  html5QrCode
    .start(
      cameraId,
      {
        fps: 10,
        qrbox: formato === 'qr' ? { width: 250, height: 250 } : undefined,
        formatsToSupport:
          formato === 'qr'
            ? [Html5QrcodeSupportedFormats.QR_CODE]
            : [
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.CODE_39,
              ],
      },
      (decodedText) => {
        alert(`📦 Código detectado: ${decodedText}`);
        html5QrCode.stop().then(() => {
          $reader.hide();
          html5QrCode = null;
        });
      },
      () => {} // Ignorar errores comunes
    )
    .catch((err) => {
      $status.text(`❌ Error al iniciar cámara: ${err}`);
    });
};

// Botones
$btnQR.on('click', () => iniciarLectura('qr'));
$btnBar.on('click', () => iniciarLectura('bar'));

// Cerrar lector manualmente
$btnCerrar.on('click', () => {
  if (html5QrCode?.isScanning) {
    html5QrCode
      .stop()
      .then(() => {
        $reader.hide();
        html5QrCode = null;
        $status.text('📴 Lectura detenida.');
      })
      .catch((err) => {
        $status.text(`❌ Error al detener cámara: ${err}`);
      });
  }
});
