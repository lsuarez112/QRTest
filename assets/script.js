// Referencias a los elementos del DOM usando jQuery
const $status = $('#status');
const $btnQR = $('#btnQR');
const $btnBar = $('#btnBar');
const $cameraSelect = $('#cameraSelect');
const $reader = $('#reader');
let html5QrCode; // Instancia del lector QR
let cameraId; // ID de la cámara seleccionada

// Detección y selección automática de cámaras disponibles
Html5Qrcode.getCameras()
  .then((cameras) => {
    if (cameras.length) {
      // Busca una cámara trasera (back/rear) o selecciona la primera disponible
      let backCam = cameras.find((c) => /back|rear/i.test(c.label));
      cameraId = backCam ? backCam.id : cameras[0].id;

      // Actualiza el estado con la cámara seleccionada
      $status.text(
        `✅ Cámaras detectadas (${cameras.length}). Se seleccionó: ${
          backCam ? backCam.label : cameras[0].label || 'por defecto'
        }`
      );

      // Muestra el selector de cámaras y lo llena con las opciones disponibles
      $cameraSelect.show();
      cameras.forEach((cam, i) => {
        const $opt = $('<option>')
          .val(cam.id)
          .text(cam.label || `Cámara ${i + 1}`);
        if (cam.id === cameraId) $opt.prop('selected', true);
        $cameraSelect.append($opt);
      });

      // Permite cambiar manualmente la cámara seleccionada
      $cameraSelect.on('change', (e) => {
        cameraId = $(e.target).val();
        $status.text(
          `✅ Cámara seleccionada manualmente: ${$cameraSelect
            .find('option:selected')
            .text()}`
        );
      });

      // Muestra los botones para iniciar la lectura
      $btnQR.show();
      $btnBar.show();
    } else {
      // Si no se detectan cámaras, muestra un mensaje de error
      $status.text('❌ No se detectaron cámaras.');
    }
  })
  .catch((err) => {
    // Manejo de errores al obtener las cámaras
    $status.text(`❌ Error al obtener cámaras: ${err}`);
  });

// Función para iniciar la lectura de códigos
const iniciarLectura = (formato) => {
  if (!cameraId) {
    alert('Selecciona una cámara válida.');
    return;
  }

  // Detiene cualquier lectura previa
  html5QrCode?.stop().catch(() => {});
  html5QrCode = new Html5Qrcode('reader'); // Crea una nueva instancia del lector
  $reader.show(); // Muestra el contenedor del lector

  // Configura y comienza la lectura
  html5QrCode
    .start(
      cameraId,
      {
        fps: 10, // Velocidad de fotogramas por segundo
        qrbox: formato === 'qr' ? { width: 250, height: 250 } : undefined, // Tamaño del área de escaneo para QR
        formatsToSupport:
          formato === 'qr'
            ? [Html5QrcodeSupportedFormats.QR_CODE] // Solo QR
            : [
                // Formatos de códigos de barras soportados
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.CODE_39,
              ],
      },
      (decodedText) => {
        // Callback al detectar un código
        alert(`📦 Código detectado: ${decodedText}`);
        html5QrCode.stop().then(() => {
          $reader.hide(); // Oculta el lector tras la detección
        });
      },
      (errorMessage) => {
        // Ignora errores comunes de escaneo
      }
    )
    .catch((err) => {
      // Manejo de errores al iniciar la cámara
      $status.text(`❌ Error al iniciar cámara: ${err}`);
    });
};

// Eventos para los botones de lectura
$btnQR.on('click', () => iniciarLectura('qr')); // Inicia lectura de QR
$btnBar.on('click', () => iniciarLectura('bar')); // Inicia lectura de códigos de barras
