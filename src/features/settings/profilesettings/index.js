import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import TitleCard from '../../../components/Cards/TitleCard';
import { showNotification } from '../../common/headerSlice';
import InputText from '../../../components/Input/InputText';
import TextAreaInput from '../../../components/Input/TextAreaInput';
import ToogleInput from '../../../components/Input/ToogleInput';

function ProfileSettings() {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    id: '',
    fullName: '',
    email: '',
    telephoneNumber: '',
    identifyNumber: '',
    userInformation: '',
    roles: '',
  });

  // Trạng thái loading
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

        console.log('User Data:', response.data.data); // Log dữ liệu trả về để kiểm tra

        if (response.data.status === 200) {
          setUser(response.data.data);  // Cập nhật state user
        } else {
          console.error('Failed to fetch user:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false); // Kết thúc quá trình loading
      }
    };

    fetchUserProfile();
  }, []);

  // ✅ Cập nhật giá trị form
  const updateFormValue = ({ updateType, value }) => {
    setUser(prevState => ({
      ...prevState,
      [updateType]: value,
    }));
  };

  // ✅ Gửi cập nhật thông tin user
  const updateProfile = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await axios.put(
        `http://103.162.15.61:8080/api/v1/user/${user.id}`,
        {
          fullName: user.fullName,
          username: user.username,
          telephoneNumber: user.telephoneNumber,
          identifyNumber: user.identifyNumber,
          userInformation: user.userInformation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 200) {
        dispatch(showNotification({ message: 'Profile Updated', status: 1 }));
      } else {
        console.error('Failed to update profile:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Nếu dữ liệu vẫn chưa được tải (loading)
  if (loading) {
    return <div>Loading...</div>;  // Hiển thị thông báo đang tải
  }

  return (
    <>
      <TitleCard title="Profile Settings" topMargin="mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Full Name"
            value={user.fullName || ''}
            updateType="fullName"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Email Id"
            value={user.username || ''}
            updateType="email"
            disabled={true}
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Phone Number"
            value={user.telephoneNumber || ''}
            updateType="telephoneNumber"
            updateFormValue={updateFormValue}
          />
          <InputText
            labelTitle="Identify Number"
            value={user.identifyNumber || ''}
            updateType="identifyNumber"
            updateFormValue={updateFormValue}
          />
          <TextAreaInput
            labelTitle="User Information"
            value={user.userInformation || ''}
            updateType="userInformation"
            updateFormValue={updateFormValue}
          />
        </div>
        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputText
            labelTitle="Role"
            value={user.roles || ''}
            updateType="roles"
            disabled={true} // Khoá trường role
            updateFormValue={updateFormValue}
          />
          <ToogleInput
            updateType="syncData"
            labelTitle="Sync Data"
            defaultValue={true}
            updateFormValue={updateFormValue}
          />
        </div>

        <div className="mt-16">
          <button className="btn btn-primary float-right" onClick={updateProfile}>
            Update
          </button>
        </div>
      </TitleCard>
    </>
  );
}

export default ProfileSettings;
