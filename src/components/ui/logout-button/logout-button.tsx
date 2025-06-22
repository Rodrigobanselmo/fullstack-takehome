"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Button from "../button/button";

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      success
    }
  }
`;

export default function LogoutButton() {
  const router = useRouter();
  const [logout, { loading }] = useMutation(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      color="grey"
      disabled={loading}
    >
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
