import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "07707901154";
const WHATSAPP_MESSAGE = "السلام عليكم، أود التواصل معكم";

export default function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    // Format: https://wa.me/[country code][phone number]
    // Iraq country code: +964
    const phoneNumber = WHATSAPP_NUMBER.replace(/^0/, "964"); // Replace leading 0 with 964
    const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all z-40 bg-green-500 hover:bg-green-600 text-white"
      size="lg"
    >
      <MessageCircle className="w-6 h-6 ml-2" />
      تواصل معنا على واتساب
    </Button>
  );
}
