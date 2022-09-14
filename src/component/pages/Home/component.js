import React, { PureComponent } from 'react';
import JsonToForm from 'json-reactform';
import { Helmet } from 'react-helmet';
import { Modal, Button, ModalHeader, ModalBody, ModalFooter, Nav } from 'reactstrap';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import ReactLoading from 'react-loading';
import Navbar from '../../elements/Navbar';
import DataTable from 'react-data-table-component';
import CurrencyFormat from 'react-currency-format';

const model = {
  "Komoditas": {
    "type": "text",
    "required": true
  },
  "Area": {
    "type": "select",
    "required": true,
    "options": [
    ],
  },
  "Ukuran": {
    "type": "select",
    "required": true,
    "options": [
    ],
  },
  "Harga": {
    "type": "Number",
    "required": true
  },
  "Simpan": {
    "type": "submit",
  }
}

const columns = [
  {
    name: 'Komoditas',
    selector: row => row.komoditas,
    sortable: true,
    sortFunction: (rowA, rowB) => {
      const a = rowA.komoditas.toLowerCase();
      const b = rowB.komoditas.toLowerCase();

      if (a > b) {
          return 1;
      }

      if (b > a) {
          return -1;
      }

      return 0;
    }
  },
  {
    name: 'Harga',
    selector: row => <CurrencyFormat value={row.price} displayType={'text'} thousandSeparator={true} prefix={'Rp. '} />,
    sortable: true,
    sortFunction: (rowA, rowB) => {
      const a = Number(rowA.price);
      const b = Number(rowB.price);

      if (a > b) {
          return 1;
      }

      if (b > a) {
          return -1;
      }

      return 0;
    }
  },
  {
    name: 'Ukuran',
    selector: row => row.size,
    sortable: true
  },
  {
    name: 'Provinsi',
    selector: row => row.area_provinsi,
    sortable: true
  },
  {
    name: 'Kota',
    selector: row => row.area_kota,
    sortable: true
  },
];
export default class Home extends PureComponent {
  state = {
    show: false,
    showSuccess: false,
    listUkuran: [],
    listArea: [],
    loadingCreate: false,
    search: '',
    activeIdDelete: null,
    activeIdUpdate: null
  }
  componentDidMount() {
    const { actions: { requestDataInit } } = this.props;
    requestDataInit();
  }
  componentWillReceiveProps({ home }) {
    const { listUkuran, listArea, show, loadingCreate, activeIdDelete, activeIdUpdate } = this.state;

    if (listUkuran.length === 0 && home?.sizes?.data?.length > 0) {
      const { sizes: { data } } = home, arrUkuran = [];
      data.forEach((_) => {
        arrUkuran.push({ label: _.size, value: _.size })
      })
      this.setState({ listUkuran: arrUkuran });
    }

    if (listArea.length === 0 && home?.areas?.data?.length > 0) {
      const { areas: { data } } = home, arrArea = [];
      data.forEach((_) => {
        arrArea.push({ label: `${_.province}, ${_.city}`, value: `${_.province}, ${_.city}` })
      })
      this.setState({ listArea: arrArea });
    }
    if (show && home.create.data) this.setState({ show: false, showSuccess: 'Sukses menambahkan data' })
    if (activeIdDelete && home.delete.data) this.setState({ activeIdDelete: null, showSuccess: 'Sukses menghapus data' })
    if (activeIdUpdate && home.update.data) this.setState({ show: false, activeIdUpdate: null, showSuccess: 'Sukses memperbaharui data' })

    if (!loadingCreate && (home.create.fetching || home.update.fetching)) {
      document.querySelectorAll('.mb-4')[4].style.display = 'none'
      this.setState({ loadingCreate: true })
    }
  }
  _toggleModalAdd = () => {
    const { show } = this.state;
    this.setState({ show: !show, activeIdUpdate: null })
  }
  _handleSubmit = (value) => {
    const current = dayjs(), { actions: { postData, updateData } } = this.props, { activeIdUpdate } = this.state;;
    const payload = {
      uuid: activeIdUpdate || v4(),
      komoditas: value?.Komoditas || '',
      area_provinsi: value?.Area?.value ? value.Area.value.split(',')[0] : '',
      area_kota: value?.Area?.value ? value.Area.value.split(',')[1].trim() : '',
      size: value?.Ukuran.value,
      price: value?.Harga,
      tgl_parsed: current.format('YYYY-MM-DDTHH:mm:ssZ[Z]'),
      timestamp: current.valueOf()
    }
    activeIdUpdate ? updateData(payload) : postData(payload);
  }
  _toggleSuccess = () => {
    const { showSuccess } = this.state, { actions: { getData } } = this.props;
    this.setState({ showSuccess: !showSuccess, loadingCreate: showSuccess ? false : showSuccess }, () => {
      if (showSuccess) getData();
    });
  }
  _renderModalSuccess = () => {
    const { showSuccess } = this.state;
    return (
      <Modal isOpen={Boolean(showSuccess)} toggle={this._toggleSuccess}>
        <ModalHeader toggle={this._toggleSuccess}>Sukses</ModalHeader>
        <ModalBody>
          <p className="msg-success">{showSuccess}</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this._toggleSuccess} color="primary">OK</Button>
        </ModalFooter>
      </Modal>
    )
  }

  _cancelDelete = () => this.setState({ activeIdDelete: null })
  _confirmDelete = () => {
    const { actions: { deleteData } } = this.props, { activeIdDelete } = this.state;
    deleteData(activeIdDelete);
  }

  _renderModalConfirmDelete = () => {
    const { activeIdDelete } = this.state, { home: { list: { data } } } = this.props;
    const findData = data.find((_) => _.uuid === activeIdDelete);
    return (
      <Modal isOpen={Boolean(activeIdDelete)} toggle={this._cancelDelete}>
        <ModalHeader toggle={this._cancelDelete}>Konfirmasi</ModalHeader>
        <ModalBody>
          <p className="msg-success">Apakah anda yakin akan menghapus data {findData?.komoditas} ?</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this._cancelDelete} color="primary">Batal</Button>
          <Button onClick={this._confirmDelete} color="primary">OK</Button>
        </ModalFooter>
      </Modal>
    )
  }

  _renderModalAdd = () => {
    const { show, loadingCreate, activeIdUpdate } = this.state, { home: { list:  { data } } } = this.props;
    let cloneModel = { ...model };
    if (activeIdUpdate) {
      const findData = data.find((_) => _.uuid === activeIdUpdate);
      cloneModel = {
        ...model,
        Komoditas: {
          ...model.Komoditas,
          defaultValue: findData.komoditas
        },
        Ukuran: {
          ...model.Ukuran,
          defaultValue: findData.size
        },
        Harga: {
          ...model.Harga,
          defaultValue: findData.price
        },
        Area: {
          ...model.Area,
          defaultValue: `${findData.area_provinsi}, ${findData.area_kota}`
        }
      }
    }
    return (
      <Modal isOpen={show} toggle={this._toggleModalAdd}>
        <ModalHeader toggle={this._toggleModalAdd}>{`${activeIdUpdate ? 'Ubah' : 'Tambah'} Data`}</ModalHeader>
        <ModalBody>
          <JsonToForm model={cloneModel} onSubmit={this._handleSubmit} />
          <div className="col-sm-4 offset-sm-4">
            {loadingCreate && <ReactLoading type="spin" color="#038767" height={38} width={38} />}
          </div>
        </ModalBody>
      </Modal>
    )
  }
  _renderLoading = () => {
    return (
      <div className="loading-overlay">
        <ReactLoading type="spin" color="#038767" height={50} width={50} />
      </div>
    )
  }
  _handleSearch = ({ target: { value: search }}) => {
    this.setState({ search })
  }
  _handleEdit = (row) => {
    this.setState({ activeIdUpdate: row.uuid, show: true })
  }

  _handleDelete = (row) => {
    this.setState({ activeIdDelete: row.uuid })
  }
  render() {
    const { listUkuran, listArea, search } = this.state;
    const { home } = this.props;
    const clonedModel = Object.assign({}, model);
    if (listUkuran.length > 0) clonedModel.Ukuran.options = listUkuran;
    if (listArea.length > 0) clonedModel.Area.options = listArea;

    let dataFiltered = home?.list?.data?.filter((_) => _.uuid && _.komoditas && _.price && _.size && _.area_kota && _.area_provinsi) || []
    if (search) {
      dataFiltered = dataFiltered.filter(
        (_) => _.komoditas.toLowerCase().includes(search.toLowerCase()) || _.size.includes(search) || _.price.includes(search) || _.area_kota.toLowerCase().includes(search.toLowerCase()) || _.area_provinsi.toLowerCase().includes(search.toLowerCase())
      );
    }
    const modifiedColumn = Object.assign([], columns);
    modifiedColumn.push({
      name: 'Aksi',
      selector: row => (
        <>
          <Button onClick={this._handleEdit.bind(this, row)} size="sm" style={{ marginRight: 5 }} color="info">Ubah</Button>
          <Button onClick={this._handleDelete.bind(this, row)} size="sm" color="danger">Hapus</Button>
        </>
      ),
      allowOverflow: true
    });
    return (
      <>
        <Helmet>
          <title>Lauks!</title>
        </Helmet>
        <div className="container">
          <Navbar toggleModalAdd={this._toggleModalAdd} />
          <div className="row">
            <div className="table-wrapper col-10 offset-1 col-md-12 offset-md-0 mt-4">
              <DataTable
                title="Aneka Ikan"
                pagination
                subHeader
                subHeaderComponent={<input value={search} onChange={this._handleSearch} placeholder="Cari data" className="form-control" />}
                columns={modifiedColumn}
                data={dataFiltered}
                progressPending={home?.list?.fetching}
                progressComponent={
                  <div className="table-loading-container d-flex flex-column justify-content-center align-items-center">
                    <ReactLoading type="spin" color="#038767" height={38} width={38} />
                    <p className="mt-4">Memuat Data ...</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
        {home.list.fetching && listArea.length === 0 && listUkuran.length === 0 && this._renderLoading()}
        {this._renderModalAdd()}
        {this._renderModalSuccess()}
        {this._renderModalConfirmDelete()}
        <footer>
          <p>Yang ngoding <a href="https://github.com/ultimatepau">@ultimatepau</a></p>
        </footer>
      </>
    )
  }
}