// UpdateDbContainer.jsx
import { useContext } from 'react';
import AppContext from '../components/AppContext';
import CreateDataset_1 from '../components/CreateDataset_1';
import { Routes,Route } from 'react-router-dom';

const UpdateDbContainer = () => {
    const { selectedDb } = useContext(AppContext); // Ensure AppContext is correctly imported and used

    console.log("selectedDb in UpdateDbContainer: ", selectedDb);

    const updateDataset = async (updatedData) => {
      try {
                const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8000/api/datasets/${selectedDb.id}/update/`, {
                method: 'PUT',
              headers: {
                    'Authorization': `Bearer ${token}`,

                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) {
                throw new Error('Failed to update dataset');
            }
            const data = await response.json();
            console.log('Updated dataset:', data);
            // Handle success (e.g., show success message, update state, etc.)
        } catch (error) {
            console.error('Error updating dataset:', error.message);
            // Handle error (e.g., show error message to user)
        }
    };

  return (
    <Routes> 
      <Route path="/create-dataset-1"
        element={<CreateDataset_1 selectedDataset={selectedDb} updateDataset={updateDataset} isUpdateMode={true} />} />
</Routes>
    );
};

export default UpdateDbContainer;
