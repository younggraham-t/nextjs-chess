import React, {useContext, useRef, useState} from "react";
import PromotionSelection from "./promotion-selection";
import { Flag } from "@/app/utils/board/bitboard/move";

type UseModalShowReturnType = {
    show: boolean;
    setShow: (value: boolean) => void;
    onHide: () => void;
}

const useModalShow = (): UseModalShowReturnType => {
    const [show, setShow] = useState(false);

    const handleOnHide = () => {
        setShow(false);
    };

    return {
        show,
        setShow,
        onHide: handleOnHide,
    }
};

type ModalContextType = {
    showConfirmation: (x: number, y: number) => Promise<number>;
    cancelConfirmation: () => void;
};

type ConfirmationModalContextProviderProps = {
    children: React.ReactNode
}

const ConfirmationModalContext = React.createContext<ModalContextType>({} as ModalContextType);

const ConfirmationModalContextProvider: React.FC<ConfirmationModalContextProviderProps> = (props) => {
    const {setShow, show, onHide} = useModalShow();
    const [content, setContent] = useState<{x: number, y: number} | null>();
    const resolver = useRef<Function>();

    const handleShow = (x: number, y: number): Promise<number> => {
        setContent({
            x,
            y,
        });
        setShow(true);
        return new Promise(function (resolve) {
            resolver.current = resolve;
        });
    };


    const handleOk = (value: number) => {
        resolver.current && resolver.current(value);
        onHide();
    };

    const handleCancel = () => {
        resolver.current && resolver.current(Flag.canceledMove);
        onHide();
    };

    const modalContext: ModalContextType = {
        showConfirmation: handleShow,
        cancelConfirmation: handleCancel
    };

    return (
        <ConfirmationModalContext.Provider value={modalContext}>
            {props.children}
            {content && show &&
                        <PromotionSelection handleCancel={handleCancel} handleClick={handleOk} x={content.x} y={content.y}/>
                }
         </ConfirmationModalContext.Provider>
    )
};

const useConfirmationModalContext = (): ModalContextType => useContext(ConfirmationModalContext);

export {
    useModalShow,
    useConfirmationModalContext,
}

export default ConfirmationModalContextProvider;
