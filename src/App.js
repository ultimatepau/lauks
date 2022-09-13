import './index.scss';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import Home from './component/pages/Home';

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <Home />
    </Provider>
  );
}

export default App;
