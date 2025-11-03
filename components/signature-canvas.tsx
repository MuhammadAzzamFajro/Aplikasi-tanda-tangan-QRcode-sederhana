"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SignatureCanvasProps {
  onSignatureChange: (dataUrl: string) => void;
}

export default function SignatureCanvas({ onSignatureChange }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup dasar canvas
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#000";

    ctxRef.current = ctx;

    // Pastikan resolusi tinggi (retina display)
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;
    ctx.scale(scale, scale);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    const { x, y } = getPosition(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { x, y } = getPosition(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onSignatureChange(dataUrl);
    }
  };

  const getPosition = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX =
      "touches" in e
        ? e.touches[0].clientX
        : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e
        ? e.touches[0].clientY
        : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange("");
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-gray-300 rounded-lg bg-white shadow-sm relative">
        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded-lg cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        ></canvas>
      </div>
      <Button
        variant="outline"
        onClick={clearCanvas}
        className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all"
      >
        <Trash2 className="w-4 h-4" />
        Hapus Tanda Tangan
      </Button>
    </div>
  );
}
