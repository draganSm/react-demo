interface WithChildren {
  children: React.ReactNode;
}

const Layout: React.FC<WithChildren> = ({ children }) => {
  return (
    <div className="max-w-3xl px-5 py-5 mx-auto md:px-0 md:py-10">
      {children}
    </div>
  );
};

export default Layout;
