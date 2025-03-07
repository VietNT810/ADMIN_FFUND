import { useEffect, useState } from 'react';
import axios from 'axios';
import TitleCard from '../../../components/Cards/TitleCard';
import InputText from '../../../components/Input/InputText';
import TextAreaInput from '../../../components/Input/TextAreaInput';

function ProfileSettings() {
  const [user, setUser] = useState({
    id: '',
    fullName: '',
    email: '',
    telephoneNumber: '',
    identifyNumber: '',
    userInformation: '',
    roles: '',
  });

  const [loading, setLoading] = useState(true);

  // ✅ Lấy userId từ sessionStorage hoặc localStorage
  const getUserId = () => {
    return sessionStorage.getItem('userId') || localStorage.getItem('userId') || null;
  };

  // ✅ Lấy accessToken từ sessionStorage hoặc localStorage
  const getAccessToken = () => {
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken') || null;
  };

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const response = await axios.get(`http://103.162.15.61:8080/api/v1/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: '*/*',
          },
        });

        if (response.data.status === 200) {
          console.log('User Data:', response.data.data); // Log kiểm tra dữ liệu
          setUser(response.data.data);
        } else {
          console.error('Failed to fetch user:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Nếu dữ liệu chưa tải xong
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TitleCard title="Admin Profile" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Full Name"
            value={user.fullName || ''}
            disabled={true}
          />
          <InputText
            labelTitle="Email Id"
            value={user.email || ''}
            disabled={true}
          />
          <InputText
            labelTitle="Phone Number"
            value={user.telephoneNumber || ''}
            disabled={true}
          />
          <InputText
            labelTitle="Identify Number"
            value={user.identifyNumber || ''}
            disabled={true}
          />
          <TextAreaInput
            labelTitle="User Information"
            value={user.userInformation || ''}
            disabled={true}
          />
        </div>
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Role"
            value={user.roles || ''}
            disabled={true} // Role không cho chỉnh sửa
          />
        </div>
      </TitleCard>
    </>
  );
}

export default ProfileSettings;
