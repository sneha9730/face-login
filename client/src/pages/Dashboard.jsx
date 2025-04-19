import React from 'react';

const Dashboard = ({ user }) => {
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const phone = user?.phone || 'N/A';
  const email = user?.email || 'N/A';
  const photoUrl = user?.photo ? `http://localhost:9000/uploads/${user.photo}` : '';

  const onLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    window.location.href = '/login';
    if (props.onLogout) {
      props.onLogout();
  };};

  return (
    <div className="flex w-screen h-screen bg-gray-100 pt-16">
      <div className="hidden md:flex w-64 flex-col bg-white shadow">
        <div className="flex items-center justify-center h-20 border-b">
          <h3 className="text-xl font-semibold text-purple-600">MyDashboard</h3>
        </div>
        <nav className="flex-1 pt-6">
          <SidebarItem icon={<UserIcon />} label="Profile" active />
        </nav>
        <div className="p-4 border-t">
          <button onClick={onLogout} className="flex items-center text-gray-600 hover:text-red-500 w-full">
            <LogoutIcon className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-purple-600">Welcome, {fullName} 👋</h2>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="User"
                className="h-12 w-12 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <span className="font-semibold text-lg">
                  {fullName ? fullName.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-purple-600">Personal Information</h2>
            </div>
            <div className="p-6">
              <InfoItem 
                icon={<UserIcon className="text-purple-500" />} 
                label="Full Name" 
                value={fullName} 
              />
              <InfoItem 
                icon={<EmailIcon className="text-purple-500" />} 
                label="Email Address" 
                value={email} 
              />
              <InfoItem 
                icon={<PhoneIcon className="text-purple-500" />} 
                label="Phone Number" 
                value={phone} 
                last 
              />
            </div>
          </div>
          
          {/* Authentication status cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard title="Authentication Method" value="Face Recognition" />
            <StatsCard title="Login Status" value="Verified" />
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center px-6 py-3 text-gray-600 hover:bg-purple-50 hover:text-purple-600 ${
      active ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-600' : ''
    }`}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </a>
);

const InfoItem = ({ icon, label, value, last = false }) => (
  <div className={`flex items-start ${!last ? 'mb-6' : ''}`}>
    <div className="mr-4 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-gray-900">{value}</p>
    </div>
  </div>
);

const StatsCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-2xl font-semibold text-purple-600">{value}</p>
  </div>
);

const UserIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogoutIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const EmailIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const PhoneIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

export default Dashboard;