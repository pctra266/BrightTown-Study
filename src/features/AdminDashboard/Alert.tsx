import { FaCheckCircle, FaInfoCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

type AlertType = "success" | "info" | "warning";

type AlertProps = {
    type: AlertType;
    message: string;
    onClose: () => void;
};

const iconMap = {
    success: <FaCheckCircle className="text-green-500" />,
    info: <FaInfoCircle className="text-blue-500" />,
    warning: <FaExclamationCircle className="text-yellow-500" />
};

const borderMap = {
    success: "border-l-4 border-green-500",
    info: "border-l-4 border-blue-500",
    warning: "border-l-4 border-yellow-500"
};

const Alert = ({ type, message, onClose }: AlertProps) => {
    return (
        <div
            className={`fixed right-4 z-50 
                        flex items-start p-4 bg-white rounded shadow-md w-[90%] max-w-sm
                        ${borderMap[type]}`}
            style={{ top: "100px" }} // 👈 Dịch xuống 70px
        >
            <div className="text-xl mt-1 mr-3">{iconMap[type]}</div>
            <div className="flex-1">
                <h4 className="font-semibold capitalize">{type}</h4>
                <p className="text-gray-700 text-sm">{message}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 ml-2 text-lg">
                <FaTimes />
            </button>
        </div>
    );
};

export default Alert;
