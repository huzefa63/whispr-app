'use client';
import { Item, Menu, Separator, Submenu } from "react-contexify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { GoReply } from "react-icons/go";
import { MdCopyAll } from "react-icons/md";
import { TbUser, TbUsers } from "react-icons/tb";
import { handleDelete, handleReply, handleUpdate } from "../_services/message";
import { useGlobalState } from "./GlobalStateProvider";
import { useSearchParams } from "next/navigation";

function CustomMenu({MENU_ID,showEditItem}) {
    const {setEditMessage,setMessages,setReplyMessage} = useGlobalState();
    const searchParams = useSearchParams();
  return (
    <Menu
      id={MENU_ID}
      className="custom-context-menu"
      theme="dark"
      animation="slide"
    >
      {showEditItem && (
        <Item id="edit" onClick={({props}) => handleUpdate(props,setEditMessage)} className="w-full">
          <span className="w-full flex items-center gap-2">
            <FaEdit className="text-blue-400 " /> Edit
          </span>
        </Item>
      )}
      {showEditItem && <Separator />}
      {showEditItem && (
        <Submenu
          id="submenu"
          label={
            <span className="flex items-center gap-2 w-full text-sm">
              <FaTrash className="text-red-400" /> Delete
            </span>
          }
        >
          <Item
            id="delete"
            onClick={({ props }) => handleDelete(props, "me",setMessages, searchParams.get('friendId'))}
            className="w-full"
          >
            <span className="flex items-center gap-2 w-full text-sm">
              <TbUser className="text-green-300" /> For me
            </span>
          </Item>
          <Separator />
          <Item
            id="delete"
            onClick={({ props }) => handleDelete(props, "everyone",setMessages, searchParams.get('friendId'))}
            className="w-full"
          >
            <span className="flex items-center gap-2 w-full">
              <TbUsers className="text-green-300" /> For everyone
            </span>
          </Item>
        </Submenu>
      )}
      {showEditItem && <Separator />}
      <Item
        id="copy"
        onClick={({ props }) => {
          window.navigator.clipboard.writeText(props?.text);
        }}
        className="w-full"
      >
        <span className="flex items-center gap-2 w-full">
          <MdCopyAll /> Copy
        </span>
      </Item>
      <Separator />
      <Item id="copy" onClick={({props}) => handleReply(props,setReplyMessage)} className="w-full">
        <span className="flex items-center gap-2 w-full">
          <GoReply /> Reply
        </span>
      </Item>
    </Menu>
  );
}

export default CustomMenu;
