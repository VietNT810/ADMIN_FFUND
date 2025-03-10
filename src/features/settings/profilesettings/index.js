import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from './profileSlice';
import TitleCard from '../../../components/Cards/TitleCard';
import InputText from '../../../components/Input/InputText';
import TextAreaInput from '../../../components/Input/TextAreaInput';

function ProfileSettings() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <TitleCard title="Admin Profile" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText labelTitle="Full Name" value={user.fullName || ''} disabled={true} />
          <InputText labelTitle="Email Id" value={user.email || ''} disabled={true} />
          <InputText labelTitle="Phone Number" value={user.telephoneNumber || ''} disabled={true} />
          <InputText labelTitle="Identify Number" value={user.identifyNumber || ''} disabled={true} />
          <TextAreaInput labelTitle="User Information" value={user.userInformation || ''} disabled={true} />
        </div>
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText labelTitle="Role" value={user.roles || ''} disabled={true} />
        </div>
      </TitleCard>
    </>
  );
}

export default ProfileSettings;
