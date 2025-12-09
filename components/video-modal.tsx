"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/components/language-provider";

export function VideoModal() {
    const { isVideoModalOpen, setVideoModalOpen, currentLanguage, setUserTypeModalOpen } = useLanguage();
    const [videoUrl, setVideoUrl] = useState("");

    const handleClose = () => {
        setVideoModalOpen(false);
        setUserTypeModalOpen(true);
    };

    useEffect(() => {
        if (isVideoModalOpen && currentLanguage) {
            let url = "";
            switch (currentLanguage) {
                case "bn": // Bengali
                    url = "https://www.youtube.com/embed/fbGlVA3RusA?autoplay=1";
                    break;
                case "hi": // Hindi
                    url = "https://www.youtube.com/embed/6MTxu-bX1Ws?autoplay=1";
                    break;
                default: // Others
                    url = "https://www.youtube.com/embed/a6YR0jdRHv4?autoplay=1";
                    break;
            }
            setVideoUrl(url);
        }
    }, [isVideoModalOpen, currentLanguage]);

    return (
        <Dialog open={isVideoModalOpen} onOpenChange={setVideoModalOpen}>
            <DialogContent className="sm:max-w-[90vw] h-[80vh] p-0 bg-black border-none">
                <div className="relative w-full h-full">
                    <button
                        onClick={handleClose}
                        className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {videoUrl && (
                        <iframe
                            src={videoUrl}
                            className="w-full h-full rounded-lg"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
