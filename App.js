import { Navigator } from './src/navigation/index'
import { NativeBaseProvider } from 'native-base'
// import 'react-native-gesture-handler';
// import store from './src/redux/store'
// import { Provider } from 'react-redux'
// import app from './firebase'

const App = () => {
  return (
    // <Provider store={store}>
      <NativeBaseProvider>
        <Navigator />
      </NativeBaseProvider>
    // </Provider>
  )
}

export default App