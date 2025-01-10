import Popup from "../ResponPopup";

type Props = {
  show: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  modalWidth?: number;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
};

export default ({
  show,
  onClose,
  children,
  modalWidth = 480,
  style,
  bodyStyle,
}: Props) => {
  return (
    <Popup
      onClose={onClose}
      show={show}
      modalWidth={modalWidth}
      style={{
        padding: 0,
        ...style,
      }}
      bodyStyle={{
        padding: 0,
        ...bodyStyle,
      }}
    >
      {children}
    </Popup>
  );
};
