import Comp from './component';
import { connect } from 'react-redux';
import * as actions from './actions';
import { bindActionCreators } from 'redux';

const mapStateToProps = ({ home }) => ({ home });
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
});
export default connect(mapStateToProps, mapDispatchToProps)(Comp);