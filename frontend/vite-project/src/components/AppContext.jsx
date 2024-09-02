import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

// Create a single context to hold selected account, selected dataset, user information, and search results
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // State for selected account
  const [selectedAccount, setSelectedAccount] = useState(null);

  // State for selected dataset
  const [selectedDb, setSelectedDb] = useState(null);

  // State for logged-in user
  const [user, setUser] = useState({
    userid: null,
    role: null,
    // Add other necessary properties with default values
  });

  // Log when the user state is updated

    console.log('User state updated:', user);

  // State for search results
  const [searchResults, setSearchResults] = useState([]);

  // State for selected organizations
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);

  return (
    <AppContext.Provider value={{
      selectedAccount,
      setSelectedAccount,
      selectedDb,
      setSelectedDb,
      user,
      setUser,
      searchResults,
      setSearchResults,
      selectedOrganizations,
      setSelectedOrganizations
    }}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContext;
