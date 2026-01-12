// type PromotionModalProps = {
//   isOpen: boolean;
//   onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
// };

// export function PromotionModal({ isOpen, onSelect }: PromotionModalProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <h3>Choose a piece</h3>
//         {['q','r','b','n'].map(p => (
//           <button key={p} onClick={() => onSelect(p)}>
//             {p.toUpperCase()}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }
