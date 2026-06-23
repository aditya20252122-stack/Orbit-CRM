import api from "./api";

const getContacts = async () => {
  const res = await api.get("/contacts");
  return res.data;
};

const createContact = async (data) => {
  const res = await api.post("/contacts", data);
  return res.data;
};

const deleteContact = async (id) => {
  const res = await api.delete(`/contacts/${id}`);
  return res.data;
};

const contactService = {
  getContacts,
  createContact,
  deleteContact,
};

export default contactService;