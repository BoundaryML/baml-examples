import { stateAtom } from './atoms';
import { useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

function MessagesToUser() {
  const [state] = useAtom(stateAtom);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* <AnimatePresence> */}
        {state.messages
        // .slice().reverse()
          .filter((message) => message !== '')
          .map((message, index, arr) => (
            <div
              // variants={messageVariants}
              // initial="hidden"
              // animate="visible"
              // exit="exit"
              className={`p-3 rounded-lg ${
                index === arr.length - 1
                  ? 'bg-primary/10 border-l-2 border-primary'
                  : 'bg-muted/50'
              }`}
              key={`message-${index}-${message.slice(0, 10)}`}
            >
              <p className="text-sm text-foreground">{message}</p>
            </div>
          ))}
      {/* </AnimatePresence> */}
    </div>
  );
}

export { MessagesToUser };
