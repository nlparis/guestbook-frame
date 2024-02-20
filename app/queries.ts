export const followingQuery = (id: any) => `
query isFollowing {
    Wallet(input: {identity: "fc_fid:${id}", blockchain: ethereum}) {
      socialFollowers(input: {filter: {identity: {_eq: "fc_fid:196374"}}}) {
        Follower {
          dappName
          followerAddress {
            addresses
            socials {
              profileName
            }
          }
        }
      }
    }
  }
`;

export const userQuery = (id: any) => `
query userName {
    Wallet(input: {identity: "fc_fid:${id}", blockchain: ethereum}) {
      socials {
        profileDisplayName
      }
    }
  }
`;
