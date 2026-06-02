// Actividad 2 — Desestructuración y deep copy

const original = [
  {
    aseguradora: 'AFIRME',
    cotizacion: {
      cliente: {
        tipoPersona: 'fisica',
        nombre: 'prueba',
        apellidoPat: 'prueba',
        apellidoMat: 'prueba',
        rfc: '',
        fechaNacimiento: '01-01-2005',
        ocupacion: '',
        curp: '',
        direccion: {
          calle: 'oriente 945',
          noExt: '410',
          noInt: '021',
          colonia: 'prueba',
          codPostal: '56618',
          poblacion: 'mexico',
          ciudad: 'cdmx',
          pais: 'mexico',
        },
        edad: '18',
        genero: 'MASCULINO',
        telefono: '',
        email: '',
      },
    },
  },
]

// Deep copy con structuredClone — el original nunca se muta
const modified = structuredClone(original)

const { cliente } = modified[0].cotizacion

cliente.nombre            = 'Juan'
cliente.apellidoPat       = 'García'
cliente.rfc               = 'GAGJ900101ABC'
cliente.fechaNacimiento   = '15-06-1990'
cliente.email             = 'juan.garcia@email.com'
cliente.direccion.colonia = 'Del Valle'

console.log('=== ORIGINAL ===')
console.log(JSON.stringify(original, null, 2))

console.log('\n=== MODIFICADO ===')
console.log(JSON.stringify(modified, null, 2))

console.log('\n=== VERIFICACIÓN DE INMUTABILIDAD ===')
console.log('original.nombre   →', original[0].cotizacion.cliente.nombre)             // prueba
console.log('modified.nombre   →', modified[0].cotizacion.cliente.nombre)             // Juan
console.log('original.rfc      →', original[0].cotizacion.cliente.rfc)                // (vacío)
console.log('modified.rfc      →', modified[0].cotizacion.cliente.rfc)                // GAGJ900101ABC
console.log('original.colonia  →', original[0].cotizacion.cliente.direccion.colonia)  // prueba
console.log('modified.colonia  →', modified[0].cotizacion.cliente.direccion.colonia)  // Del Valle
