const PageStateMessage = ({ title, message }) => {
  return (
    <div className="container py-5">
      <div className="card shadow-sm border-0">
        <div className="card-body p-4 text-center">
          <h3 className="text-color mb-3">{title}</h3>
          <p className="text-muted mb-0">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default PageStateMessage;
