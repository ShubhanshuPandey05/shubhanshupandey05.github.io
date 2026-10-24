import { Navigate } from 'react-router-dom';

// The work archive now lives on the home page as its own chapter.
const WorkPage = () => <Navigate to={{ pathname: '/', hash: '#works' }} replace />;

export default WorkPage;
