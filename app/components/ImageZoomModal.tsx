'use client';

import { useState, useRef, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { getImageUrl } from '../lib/imageUtils';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export default function ImageZoomModal({
  isOpen,
  onClose,
  imageUrl,
  alt,
}: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="zoom-modal-overlay" onClick={onClose}>
      <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Controles */}
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={handleZoomOut}
            disabled={scale <= 1}
          >
            <ZoomOutIcon />
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={handleZoomIn}
            disabled={scale >= 4}
          >
            <ZoomInIcon />
          </button>
          <button className="zoom-btn close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Contenedor de imagen */}
        <div
          ref={containerRef}
          className="zoom-image-container"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        >
          <img
            src={getImageUrl(imageUrl)}
            alt={alt}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease',
            }}
            draggable={false}
          />
        </div>

        {/* Instrucciones */}
        <div className="zoom-instructions">
          <span>🖱️ Scroll para zoom</span>
          <span>👆 Doble clic para zoom rápido</span>
          <span>✋ Arrastra para mover</span>
        </div>
      </div>

      <style jsx>{`
        .zoom-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .zoom-modal-content {
          position: relative;
          width: 90vw;
          height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .zoom-controls {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 8px 12px;
          border-radius: 30px;
          z-index: 10;
        }

        .zoom-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .zoom-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .zoom-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .zoom-btn.close-btn {
          background: rgba(239, 68, 68, 0.8);
          margin-left: 8px;
        }

        .zoom-btn.close-btn:hover {
          background: rgba(239, 68, 68, 1);
        }

        .zoom-level {
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          min-width: 50px;
          text-align: center;
        }

        .zoom-image-container {
          flex: 1;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .zoom-image-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          user-select: none;
        }

        .zoom-instructions {
          position: absolute;
          bottom: 20px;
          display: flex;
          gap: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 10px 20px;
          border-radius: 20px;
          color: white;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .zoom-instructions {
            flex-direction: column;
            gap: 5px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
