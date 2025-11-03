"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SignatureCanvas from "@/components/signature-canvas";
import { supabase } from "@/lib/SupabaseClient";
import QRCode from "qrcode";
import { 
  Download, 
  Trash2, 
  Mail, 
  Calendar,
  FileSignature,
  QrCode,
  Info,
  User,
  LogIn,
  UserPlus,
  Shield
} from "lucide-react";

interface Signature {
  id: string;
  name: string;
  email: string;
  signature_image: string;
  qr_code: string;
  created_at: string;
}

interface Message {
  type: "success" | "error" | "";
  text: string;
}

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>("");
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState<Message>({ type: "", text: "" });
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchSignatures();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const fetchSignatures = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("signatures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching signatures:", error);
        setMessage({ type: "error", text: "Gagal mengambil data." });
      } else {
        setSignatures(data || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan tak terduga." });
    }
  };

  const generateQRCode = async (): Promise<void> => {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Nama tidak boleh kosong." });
      return;
    }
    if (!email.trim()) {
      setMessage({ type: "error", text: "Email tidak boleh kosong." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "Format email tidak valid." });
      return;
    }
    if (!signatureData || signatureData.trim() === "") {
      setMessage({ type: "error", text: "Tanda tangan tidak boleh kosong." });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const uniqueId = crypto.randomUUID();
      const signatureInfo = {
        id: uniqueId,
        name: name.trim(),
        email: email.trim(),
        timeStamp: new Date().toISOString(),
        verified: true,
      };

      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(signatureInfo), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const { error } = await supabase
        .from("signatures")
        .insert([
          {
            name: name.trim(),
            email: email.trim(),
            signature_image: signatureData,
            qr_code: qrDataUrl,
          },
        ]);

      if (error) throw error;

      setQrCode(qrDataUrl);
      setMessage({
        type: "success",
        text: "QR code berhasil dibuat dan data tersimpan.",
      });

      await fetchSignatures();

      setTimeout(() => {
        setName("");
        setEmail("");
        setSignatureData("");
        setQrCode("");
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error: any) {
      console.error("Error dalam menyimpan tanda tangan", error);
      setMessage({
        type: "error",
        text: "Gagal menyimpan tanda tangan. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = (qrCodeUrl: string, fileName: string): void => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = fileName || "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteSignature = async (id: string): Promise<void> => {
    if (!confirm("Apakah Anda yakin ingin menghapus tanda tangan ini?")) {
      return;
    }
    try {
      const { error } = await supabase.from("signatures").delete().eq("id", id);
      if (error) throw error;
      setMessage({ type: "success", text: "Tanda tangan berhasil dihapus." });
      await fetchSignatures();
    } catch (error: any) {
      console.error("Error menghapus tanda tangan:", error);
      setMessage({
        type: "error",
        text: "Gagal menghapus tanda tangan. Silakan coba lagi.",
      });
    }
  };

  const LoadingSpinner = () => (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setIsLoggedIn(false);
      setMessage({ type: "success", text: "Berhasil logout." });
      
      // Redirect to login page after logout
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: any) {
      console.error("Error logout:", error);
      setMessage({ type: "error", text: "Gagal logout. Silakan coba lagi." });
    }
  };

  const Header = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">QR Signature</h1>
          </div>
          <div className="flex gap-2">
            {isLoggedIn ? (
              <>
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-300"
                >
                  <LogIn className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
                <Button 
                  onClick={() => router.push("/signup")}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const HeroSection = () => (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        QR Tanda Tangan Elektronik
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Buat tanda tangan digital dengan QR Code verification yang aman dan terverifikasi
      </p>
    </div>
  );

  const CreateSignatureTab = () => (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileSignature className="w-6 h-6" />
          Buat Tanda Tangan Baru
        </CardTitle>
        <CardDescription className="text-blue-100">
          Isi data diri dan buat tanda tangan Anda di canvas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 transition-all duration-200 focus:scale-105"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 transition-all duration-200 focus:scale-105"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Tanda Tangan <span className="text-red-500">*</span>
          </Label>
          <SignatureCanvas onSignatureChange={setSignatureData} />
          <p className="text-sm text-gray-500 flex items-center gap-2">
            💡 Gunakan mouse atau touchpad untuk menggambar tanda tangan
          </p>
        </div>

        <Button
          onClick={generateQRCode}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              Menyimpan...
            </>
          ) : (
            <>
              <QrCode className="w-5 h-5 mr-2" />
              Generate QR Code & Simpan
            </>
          )}
        </Button>

        {message.text && (
          <Alert
            className={`transition-all duration-500 ease-out animate-in fade-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
            }`}
          >
            <AlertDescription
              className={
                message.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }
            >
              {message.type === "success" ? "✅ " : "❌ "}
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {qrCode && (
          <div className="flex justify-center transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4">
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-blue-200 max-w-md w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardTitle className="text-center mb-4 text-lg text-gray-700 flex items-center justify-center gap-2">
                🎉 QR Code Berhasil Dibuat!
              </CardTitle>
              <div className="bg-white p-4 rounded-lg shadow-inner transform transition-transform duration-300 hover:scale-105">
                <img src={qrCode} alt="QR Code" className="mx-auto" />
              </div>
              <Button
                onClick={() =>
                  downloadQRCode(
                    qrCode,
                    `qr-${name.replace(/\s+/g, "-")}.png`
                  )
                }
                variant="outline"
                className="w-full mt-4 flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const HistoryTab = () => (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileSignature className="w-6 h-6" />
          Riwayat Tanda Tangan
        </CardTitle>
        <CardDescription className="text-indigo-100">
          Daftar semua tanda tangan yang telah dibuat ({signatures.length})
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {signatures.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <FileSignature className="w-16 h-16 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">
              Belum ada tanda tangan yang tersimpan
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Buat tanda tangan pertama Anda di tab "Buat Tanda Tangan"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {signatures.map((sig, index) => (
              <Card
                key={sig.id}
                className="p-4 bg-gradient-to-r from-gray-50 to-white hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        #{signatures.length - index}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {sig.name}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {sig.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(sig.created_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-center md:col-span-2">
                    <div className="border-2 border-gray-200 rounded-lg bg-white p-4 w-full max-w-xs transition-all duration-300 hover:shadow-md">
                      <img
                        src={sig.signature_image}
                        alt="Signature"
                        className="max-h-20 mx-auto"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <img
                      src={sig.qr_code}
                      alt="QR Code"
                      className="w-24 h-24 border-2 border-gray-200 rounded-lg bg-white p-2 transition-all duration-300 hover:scale-110"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadQRCode(
                            sig.qr_code,
                            `qr-${sig.name.replace(/\s+/g, "-")}.png`
                          )
                        }
                        className="flex items-center gap-1 transition-all duration-200 hover:scale-110"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 flex items-center gap-1 transition-all duration-200 hover:scale-110"
                        onClick={() => deleteSignature(sig.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const FooterInfo = () => (
    <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">
              ℹ️ Informasi Aplikasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Tanda tangan disimpan secara aman di Supabase</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>QR Code berisi informasi verifikasi tanda tangan</span>
              </div>
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-purple-600" />
                <span>Dapat digunakan untuk keperluan dokumen digital</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Setiap tanda tangan memiliki timestamp unik</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <HeroSection />

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="create" className="text-base flex items-center gap-2">
              <FileSignature className="w-4 h-4" />
              Buat Tanda Tangan
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base flex items-center gap-2">
              <FileSignature className="w-4 h-4" />
              Riwayat ({signatures.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <CreateSignatureTab />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
        </Tabs>

        <FooterInfo />
      </div>
    </div>
  );
}