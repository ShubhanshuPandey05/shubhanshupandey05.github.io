import api from './api';

const uploadMedia = async (file, { folder, resourceType } = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    if (folder) {
        formData.append('folder', folder);
    }

    if (resourceType) {
        formData.append('resourceType', resourceType);
    }

    const { data } = await api.post('/uploads', formData);

    return data.url;
};

export default uploadMedia;