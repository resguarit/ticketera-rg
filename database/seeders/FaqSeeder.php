<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FaqCategory;
use App\Models\Faq;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ticketsCategory = FaqCategory::where('title', 'Compra de Tickets')->first();
        $paymentCategory = FaqCategory::where('title', 'Pagos y Facturación')->first();
        $eventsCategory = FaqCategory::where('title', 'Eventos')->first();
        $accountCategory = FaqCategory::where('title', 'Cuenta y Perfil')->first();

        $faqs = [
            // Compra de Tickets
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Cómo puedo comprar tickets?',
                'answer' => 'El proceso de compra es simple y seguro: 1) Navega por nuestros eventos y selecciona el que te interese. 2) Elige la cantidad de tickets que deseas comprar. 3) Completa tus datos personales (nombre, email, DNI, teléfono). 4) Ingresa la información de tu tarjeta de crédito o débito (Visa, Mastercard, Amex). 5) Confirma tu compra aceptando nuestros términos y condiciones. Una vez procesado el pago, recibirás tus tickets por email con un código QR único para el ingreso al evento. Tenés 10 minutos para completar tu compra una vez seleccionados los tickets.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Necesito crear una cuenta para comprar?',
                'answer' => 'No es obligatorio crear una cuenta antes de comprar. Durante el proceso de compra, si ingresás un email que no está registrado, el sistema creará automáticamente una cuenta para vos con una contraseña temporal que recibirás por email. Esto te permitirá acceder a tus tickets en cualquier momento desde "Mis Entradas". Si ya tenés cuenta, simplemente iniciá sesión para una compra más rápida.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Cuánto tiempo tengo para completar mi compra?',
                'answer' => 'Una vez que seleccionás tus tickets, tenés 10 minutos para completar el proceso de compra. Durante ese tiempo, los tickets quedan reservados solo para vos. Si el tiempo expira, los tickets se liberan automáticamente y deberás volver a seleccionarlos. Verás un contador en la parte superior de la página de compra que te indica el tiempo restante.',
                'order' => 3,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Puedo cancelar o solicitar reembolso de mi compra?',
                'answer' => 'Las políticas de cancelación y reembolso están detalladas en nuestros Términos y Condiciones (sección 5). En resumen: podés ejercer tu derecho de arrepentimiento dentro de los 10 días de la compra según la Ley de Defensa del Consumidor, las cancelaciones por el organizador dan derecho a reembolso completo, y las cancelaciones por el comprador están sujetas a la política del organizador. Para más información, consultá la sección completa de "Cancelaciones, Reembolsos y Arrepentimiento" en nuestros Términos y Condiciones o contactanos por WhatsApp al +54 9 2216 91-4649.',
                'order' => 4,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Los precios incluyen impuestos?',
                'answer' => 'Sí, todos los precios mostrados en nuestra plataforma ya incluyen impuestos y cargos por servicio. El precio que ves es el precio final que pagarás. No hay costos ocultos ni sorpresas al momento de finalizar tu compra.',
                'order' => 5,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Hay límite de tickets por persona?',
                'answer' => 'Sí, generalmente hay un límite de 10 tickets por persona por evento para garantizar disponibilidad para todos los interesados. Este límite puede variar según el evento específico y las políticas del organizador.',
                'order' => 6,
            ],
            [
                'faq_category_id' => $ticketsCategory->id,
                'question' => '¿Qué son los packs o lotes de tickets?',
                'answer' => 'Algunos eventos ofrecen packs o lotes que incluyen múltiples tickets a un precio especial. Por ejemplo, un pack de 4 entradas te da acceso para 4 personas. Cuando comprás un lote, recibirás varios códigos QR individuales, uno para cada persona del grupo. Esto facilita el ingreso al evento y puede representar un ahorro en el precio total.',
                'order' => 7,
            ],

            // Pagos y Facturación
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Qué métodos de pago aceptan?',
                'answer' => 'Aceptamos todas las principales tarjetas de crédito y débito: Visa (crédito, débito y prepaga), Mastercard (crédito, débito y prepaga) y American Express. Podés pagar en cuotas según tu tarjeta y el monto de la compra. El sistema te mostrará las opciones de cuotas disponibles durante la compra.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Es seguro pagar en línea?',
                'answer' => 'Absolutamente. Utilizamos la plataforma de pagos Decidir (Prisma Medios de Pago) con encriptación SSL de 256 bits y cumplimos con los estándares internacionales PCI DSS para proteger tu información financiera. Tus datos de tarjeta se procesan de forma segura y tokenizada, y nunca se almacenan en nuestros servidores. Todas las transacciones están protegidas contra fraude.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Puedo pagar en cuotas?',
                'answer' => 'Sí, podés financiar tu compra en cuotas según las opciones disponibles de tu tarjeta de crédito. Durante el proceso de pago, seleccioná tu tarjeta y el sistema te mostrará automáticamente las opciones de cuotas disponibles (1, 3, 6, 12 cuotas, etc.) según tu tipo de tarjeta y el monto de la compra. Las cuotas sin interés dependen de las promociones vigentes de cada banco.',
                'order' => 3,
            ],
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Qué hago si mi pago fue rechazado?',
                'answer' => 'Si tu pago fue rechazado, puede deberse a varios motivos: fondos insuficientes, datos incorrectos, límite de compra alcanzado, o problemas de seguridad bancaria. Te recomendamos: 1) Verificar que los datos de tu tarjeta sean correctos. 2) Contactar a tu banco para autorizar la compra. 3) Intentar con otra tarjeta. 4) Si el problema persiste, contactanos por WhatsApp al +54 9 2216 91-4649 y te ayudaremos a resolver el inconveniente.',
                'order' => 4,
            ],
            [
                'faq_category_id' => $paymentCategory->id,
                'question' => '¿Recibiré una factura o comprobante de compra?',
                'answer' => 'Sí, después de completar tu compra recibirás por email un comprobante con todos los detalles de tu orden: número de transacción, tickets comprados, monto pagado, datos del evento y tus tickets con códigos QR. Este email sirve como comprobante de compra y podés descargarlo o imprimirlo cuando lo necesites.',
                'order' => 5,
            ],

            // Eventos
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Cómo recibo mis tickets después de comprar?',
                'answer' => 'Inmediatamente después de confirmar tu pago, recibirás un email con tus tickets en formato PDF con códigos QR únicos. Podés descargarlos desde el email o acceder a ellos en cualquier momento desde tu cuenta en "Mis Entradas". Te recomendamos guardarlos en tu celular o imprimirlos para presentarlos en la entrada del evento. Cada ticket tiene un código QR único e irrepetible.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Qué pasa si se cancela o reprograma un evento?',
                'answer' => 'La política completa sobre cancelaciones y reprogramaciones de eventos está detallada en nuestros Términos y Condiciones (sección 5.1 y 5.2). Si el evento es cancelado por el organizador, tenés derecho a reembolso completo del valor de tus tickets. Si el evento se reprograma, tus tickets siguen siendo válidos para la nueva fecha, pero podés solicitar reembolso si no podés asistir. Te notificaremos inmediatamente por email sobre cualquier cambio. Para más detalles, consultá nuestros Términos y Condiciones o contactanos por WhatsApp.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Qué pasa si llego tarde al evento?',
                'answer' => 'La política de entrada tardía depende exclusivamente del organizador de cada evento. Algunos eventos permiten entrada tardía, mientras que otros tienen horarios estrictos y no permiten el ingreso después de cierto momento. Te recomendamos revisar los términos y condiciones específicos del evento en su página de detalle y llegar con tiempo suficiente. En caso de duda, contactá al organizador o a nuestro equipo de soporte.',
                'order' => 4,
            ],
            [
                'faq_category_id' => $eventsCategory->id,
                'question' => '¿Cómo funcionan los códigos QR de los tickets?',
                'answer' => 'Cada ticket que comprás tiene un código QR único e irrepetible que sirve para validar tu entrada al evento. Al llegar al evento, presentá tu código QR (desde tu celular o impreso) para ser escaneado en la entrada. El sistema verificará automáticamente la validez del ticket y registrará tu ingreso. Una vez escaneado, el código QR se marca como usado y no puede volver a utilizarse, garantizando la seguridad del evento.',
                'order' => 5,
            ],

            // Cuenta y Perfil
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Cómo creo una cuenta?',
                'answer' => 'Tenés dos formas de crear una cuenta: 1) Haciendo clic en "Iniciar Sesión" en el menú superior y luego en "Crear cuenta", donde necesitarás tu email y una contraseña segura. 2) Automáticamente durante el proceso de compra: si comprás con un email no registrado, el sistema creará una cuenta para vos y te enviará una contraseña temporal por email que luego podrás cambiar desde tu perfil.',
                'order' => 1,
            ],
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Olvidé mi contraseña, qué hago?',
                'answer' => 'No te preocupes, es muy fácil recuperarla. Hacé clic en "¿Olvidaste tu contraseña?" en la página de inicio de sesión, ingresá tu email registrado y te enviaremos un enlace seguro para restablecer tu contraseña. El enlace es válido por 60 minutos. Si no recibís el email, revisá tu carpeta de spam o intentá nuevamente. Si compraste como invitado, buscá el email de bienvenida con tu contraseña temporal.',
                'order' => 2,
            ],
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Puedo cambiar mi información personal?',
                'answer' => 'Sí, podés actualizar tu información personal (nombre, apellido, teléfono, DNI, dirección) en cualquier momento desde la configuración de tu cuenta accediendo a "Mi Cuenta" en el menú de usuario. Es importante mantener tus datos actualizados, especialmente tu email y teléfono, para recibir notificaciones importantes sobre tus compras y eventos.',
                'order' => 3,
            ],
            [
                'faq_category_id' => $accountCategory->id,
                'question' => '¿Dónde puedo ver mis tickets comprados?',
                'answer' => 'Todos tus tickets están disponibles en la sección "Mis Entradas" de tu cuenta. Ahí podrás ver el historial completo de tus compras, descargar los tickets en PDF y ver los códigos QR. También podés descargar todos los tickets de una orden completa haciendo clic en "Descargar Todos".',
                'order' => 4,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
