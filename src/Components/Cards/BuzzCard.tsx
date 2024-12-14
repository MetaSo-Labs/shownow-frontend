/* eslint-disable @typescript-eslint/no-explicit-any */
// import FollowButton from "../Buttons/FollowButton";
import { Heart, Link as LucideLink, MessageCircle } from 'lucide-react';
import { Send } from 'lucide-react';
import { isEmpty, isNil } from 'ramda';
import cls from 'classnames';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import { fetchCurrentBuzzComments, fetchCurrentBuzzLikes, fetchFollowDetailPin, fetchFollowingList, getPinDetailByPid } from '@/request/api';
import { BASE_MAN_URL, curNetwork, FLAG } from '@/config';
import { Avatar, message } from 'antd';


type IProps = {
  buzzItem: API.Pin | undefined;
  onBuzzDetail?: (txid: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  showFollowButton?: boolean;
};

const BuzzCard = ({
  buzzItem,
  onBuzzDetail,
  innerRef,
  showFollowButton = true,
}: IProps) => {
  const [showTranslateResult, setShowTranslateResult] = useState(false);

  const [myFollowingList, setMyFollowingList] = useAtom(myFollowingListAtom);
  const connected = useAtomValue(connectedAtom);
  const btcConnector = useAtomValue(btcConnectorAtom);
  const globalFeeRate = useAtomValue(globalFeeRateAtom);
  const userInfo = useAtomValue(userInfoAtom);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // console.log('buzzitem', buzzItem);
  const isFromBtc = buzzItem?.chainName === 'btc';
  let summary = buzzItem!.contentSummary;
  const isSummaryJson = summary.startsWith('{') && summary.endsWith('}');
  // console.log("isjson", isSummaryJson);
  // console.log("summary", summary);
  const parseSummary = isSummaryJson ? JSON.parse(summary) : {};

  summary = isSummaryJson ? parseSummary.content : summary;



  const attachPids =
    isSummaryJson && !isEmpty(parseSummary?.attachments ?? []) && isFromBtc
      ? (parseSummary?.attachments ?? []).map(
        (d: string) => d.split('metafile://')[1]
      )
      : [];

  const quotePinId =
    isSummaryJson && !isEmpty(parseSummary?.quotePin ?? '')
      ? parseSummary.quotePin
      : '';
  const { isLoading: isQuoteLoading, data: quoteDetailData } = useQuery({
    enabled: !isEmpty(quotePinId),
    queryKey: ['buzzDetail', quotePinId],
    queryFn: () => getPinDetailByPid({ pid: quotePinId }),
  });

  // const attachPids = ["6950f69d7cb83a612fc773d95500a137888f157f1d377cc69c2dd703eebd84eei0"];
  // console.log("current address", buzzItem!.address);

  const { data: currentLikeData } = useQuery({
    queryKey: ['payLike', buzzItem!.id,],
    queryFn: () =>
      fetchCurrentBuzzLikes({
        pinId: buzzItem!.id,
      }),
  });

  const commentData = useQuery({
    enabled: !isNil(buzzItem?.id),
    queryKey: ['comment-detail', buzzItem!.id],
    queryFn: () => fetchCurrentBuzzComments({ pinId: buzzItem!.id }),
  });

  const isLikeByCurrentUser = (currentLikeData ?? [])?.find(
    (d) => d?.pinAddress === btcConnector?.address
  );

  const currentUserInfoData = useQuery({
    queryKey: ['userInfo', buzzItem!.address],
    queryFn: () =>
      btcConnector?.getUser({
        network: curNetwork,
        currentAddress: buzzItem!.address,
      }),
  });
  const metaid = currentUserInfoData?.data?.metaid;

  const attachData = useQueries({
    queries: attachPids.map((id: string) => {
      return {
        queryKey: ['post', id],
        queryFn: () => getPinDetailByPid({ pid: id }),
      };
    }),
    combine: (results: any) => {
      return {
        data: results.map((result: any) => result.data),
        pending: results.some((result: any) => result.isPending),
      };
    },
  });

  const { data: myFollowingListData } = useQuery({
    queryKey: ['myFollowing', btcConnector?.metaid],
    enabled: !isEmpty(btcConnector?.metaid ?? ''),
    queryFn: () =>
      fetchFollowingList({
        metaid: btcConnector?.metaid ?? '',
        params: { cursor: '0', size: '100', followDetail: false },
      }),
  });

  const { data: followDetailData } = useQuery({
    queryKey: ['followDetail', btcConnector?.metaid, metaid],
    enabled: !isEmpty(btcConnector?.metaid ?? '') && !isEmpty(metaid),
    queryFn: () =>
      fetchFollowDetailPin({
        metaId: metaid ?? '',
        followerMetaId: btcConnector?.metaid ?? '',
      }),
  });

  const renderImages = (pinIds: string[]) => {
    if (pinIds.length === 1) {
      return (
        <>
          <img
            onClick={() => {
              handleImagePreview(pinIds[0]);
            }}
            className='image h-[60%] w-[60%] !rounded-md'
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            src={`${BASE_MAN_URL}/content/${pinIds[0]}`}
            alt=''
            key={pinIds[0]}
          />
          <dialog id={`preview_modal_${pinIds[0]}`} className='modal  !z-20'>
            <div className='modal-box bg-[#191C20] !z-20 py-5  w-[90%] lg:w-[50%]'>
              <form method='dialog'>
                {/* if there is a button in form, it will close the modal */}
                <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
                  ✕
                </button>
              </form>
              <h3 className='font-medium text-white text-[16px] text-center'>
                Image Preview
              </h3>

              <img
                className='image w-auto mt-6 !rounded-md'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  width: '100%',
                  height: '100%',
                }}
                src={`${BASE_MAN_URL}/content/${pinIds[0]}`}
                alt=''
              />
            </div>
            <form method='dialog' className='modal-backdrop'>
              <button>close</button>
            </form>
          </dialog>
        </>
      );
    }
    return (
      <>
        <div className='grid grid-cols-3 gap-2 place-items-center'>
          {pinIds.map((pinId) => {
            return (
              <div key={pinId}>
                <img
                  className='image !rounded-md self-center'
                  onClick={() => {
                    handleImagePreview(pinId);
                  }}
                  style={{
                    objectFit: 'cover',
                    // objectPosition: 'center',

                    width: '250px',
                    height: '250px',
                  }}
                  src={`${BASE_MAN_URL}/content/${pinId}`}
                  alt=''
                  key={pinId}
                />
                <dialog id={`preview_modal_${pinId}`} className='modal  !z-20'>
                  <div className='modal-box bg-[#191C20] !z-20 py-5 w-[90%] lg:w-[50%]'>
                    <form method='dialog'>
                      {/* if there is a button in form, it will close the modal */}
                      <button className='border border-white text-white btn btn-xs btn-circle absolute right-5 top-5.5'>
                        ✕
                      </button>
                    </form>
                    <h3 className='font-medium text-white text-[16px] text-center'>
                      Image Preview
                    </h3>
                    <img
                      className='image h-[48px] w-auto mt-6 !rounded-md'
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                      src={`${BASE_MAN_URL}/content/${pinId}`}
                      alt=''
                    />
                  </div>
                  <form method='dialog' className='modal-backdrop'>
                    <button>close</button>
                  </form>
                </dialog>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const handleImagePreview = (pinId: string) => {
    const preview_modal = document.getElementById(
      `preview_modal_${pinId}`
    ) as HTMLDialogElement;
    preview_modal.showModal();
  };

  const detectUrl = (summary: string) => {
    const urlReg = /(https?:\/\/[^\s]+)/g;

    const urls = summary.match(urlReg);

    if (urls) {
      urls.forEach(function (url) {
        // const replacement = (
        //   <div
        //     dangerouslySetInnerHTML={{
        //       __html: `<a href="${url}" style="text-decoration: underline;">${url}</a>`,
        //     }}
        //   />
        // );
        summary = summary.replace(
          url,
          `<a href="${url}" target="_blank" style="text-decoration: underline;">${url}</a>`
        );
      });
    }

    return summary;
  };

  const handleSpecial = (summary: string) => {
    summary = summary
      .replace('<metaid_flag>', 'metaid_flag')
      .replace('<operation>', 'operation')
      .replace('<path>', 'path')
      .replace('<encryption>', 'encryption')
      .replace('<version>', 'version')
      .replace('<content-type>', 'content-type')
      .replace('<payload>', 'payload');
    return summary;
  };



  const renderBasicSummary = (summary: string) => {
    return (
      <div className='flex flex-col gap-2.5'>
        {(summary ?? '').split('\n').map((line, index) => (
          <span key={index} className='break-all'>
            <div
              dangerouslySetInnerHTML={{
                __html: handleSpecial(detectUrl(line)),
              }}
            />
          </span>
        ))}
      </div>
    );
  };

  const renderSummary = (summary: string, showDetail: boolean) => {
    return (
      <>
        {showDetail ? (
          <>
            {summary.length < 800 ? (
              renderBasicSummary(summary)
            ) : (
              <div className='flex flex-col gap-0'>
                {renderBasicSummary(summary.slice(0, 800) + '...')}
                <span className=' text-main'>{' more >>'}</span>
              </div>
            )}
          </>
        ) : (
          renderBasicSummary(summary)
        )}
      </>
    );
  };

  const handleLike = async (pinId: string) => {


    if (isLikeByCurrentUser) {
      message.error('You have already liked that buzz...');
      return;
    }

    const likeEntity = await btcConnector!.use('like');
    try {
      const likeRes = await likeEntity.create({
        dataArray: [
          {
            body: JSON.stringify({ isLike: '1', likeTo: pinId }),
            flag: FLAG,
            contentType: 'text/plain;utf-8',
          },
        ],
        options: {
          noBroadcast: 'no',
          feeRate: Number(globalFeeRate),
          // service: {
          //   address: environment.service_address,
          //   satoshis: environment.service_staoshi,
          // },
          // network: environment.network,
        },
      });
      console.log('likeRes', likeRes);
      if (!isNil(likeRes?.revealTxIds[0])) {
        queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
        queryClient.invalidateQueries({ queryKey: ['payLike', buzzItem!.id] });
        message.success('like buzz successfully');
      }
    } catch (error) {
      console.log('error', error);
      const errorMessage = (error as any)?.message ?? error;
      const toastMessage = errorMessage?.includes(
        'Cannot read properties of undefined'
      )
        ? 'User Canceled'
        : errorMessage;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message.error(toastMessage);
    }
  };

  const handleFollow = async () => {
    if (
      !isNil(followDetailData) &&
      (myFollowingListData?.list ?? []).includes(metaid)
    ) {
      try {
        const unfollowRes = await btcConnector!.inscribe({
          inscribeDataArray: [
            {
              operation: 'revoke',
              path: `@${followDetailData.followPinId}`,
              contentType: 'text/plain;utf-8',
              flag: FLAG,
            },
          ],
          options: {
            noBroadcast: 'no',
            // feeRate: Number(globalFeeRate),
            // service: {
            //   address: environment.service_address,
            //   satoshis: environment.service_staoshi,
            // },
            // network: environment.network,
          },
        });
        if (!isNil(unfollowRes?.revealTxIds[0])) {
          queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
          setMyFollowingList((d) => {
            return d.filter((i) => i !== metaid);
          });
          // await sleep(5000);
          message.success(
            'Unfollowing successfully!Please wait for the transaction to be confirmed.'
          );
        }
      } catch (error) {
        console.log('error', error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          'Cannot read properties of undefined'
        )
          ? 'User Canceled'
          : errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.error(toastMessage,);
      }
    } else {
      try {
        const followRes = await btcConnector!.inscribe({
          inscribeDataArray: [
            {
              operation: 'create',
              path: '/follow',
              body: currentUserInfoData.data?.metaid,
              contentType: 'text/plain;utf-8',

              flag: FLAG,
            },
          ],
          options: {
            noBroadcast: 'no',
            feeRate: Number(globalFeeRate),
            // service: {
            //   address: environment.service_address,
            //   satoshis: environment.service_staoshi,
            // },
            // network: environment.network,
          },
        });
        if (!isNil(followRes?.revealTxIds[0])) {
          queryClient.invalidateQueries({ queryKey: ['homebuzzesnew'] });
          setMyFollowingList((d: string[]) => {
            return [...d, metaid!];
          });
          // queryClient.invalidateQueries({
          //   queryKey: ['payLike', buzzItem!.id],
          // });
          // await sleep(5000);
          message.success(
            'Follow successfully! Please wait for the transaction to be confirmed!'
          );
        }
      } catch (error) {
        console.log('error', error);
        const errorMessage = (error as any)?.message ?? error;
        const toastMessage = errorMessage?.includes(
          'Cannot read properties of undefined'
        )
          ? 'User Canceled'
          : errorMessage;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        message.error(toastMessage);
      }
    }
  };

  const onProfileDetail = (address: string) => {
    navigate(`/profile/${address}`);
  };


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (isNil(buzzItem)) {
    return <div>can't fetch this buzz</div>;
  }

  return (
    <>
      <div
        className={cls(
          'w-full border border-white rounded-xl flex flex-col gap-4'
        )}
        ref={innerRef}
      >
        <div className='flex items-center justify-between pt-4 px-4'>
          <div className='dropdown dropdown-hover dropdown-right'>
            <div
              tabIndex={0}
              role='button'
              className='flex gap-2 items-center cursor-pointer'
            >
              {isNil(currentUserInfoData.data) ? (
                <div className='avatar placeholder'>
                  <div className='bg-[#2B3440] text-[#D7DDE4] rounded-full w-12'>
                    <span>{buzzItem!.metaid.slice(0, 6)}</span>
                  </div>
                </div>
              ) : (
                // <CustomAvatar
                //   userInfo={currentUserInfoData.data}
                //   onProfileDetail={onProfileDetail}
                // />
                <>
                  <Avatar
                    src={currentUserInfoData.data?.avatar}
                    alt='avatar'
                    className='avatar'
                    onClick={() => onProfileDetail(buzzItem.address)}
                  />
                </>
              )}
              <div className='flex flex-col md:text-md text-sm'>
                <div className='text-slate-200'>
                  {isNil(currentUserInfoData?.data?.name) ||
                    isEmpty(currentUserInfoData?.data?.name)
                    ? 'metaid-user-' + buzzItem.address.slice(0, 6)
                    : currentUserInfoData?.data?.name}
                </div>
                <div className='text-gray text-xs'>
                  {(metaid ?? '').slice(0, 6)}
                </div>
              </div>
            </div>

            <div tabIndex={0} className='dropdown-content'>
              <ProfileCard address={buzzItem.address} isDropdown />
            </div>
          </div>

          {btcConnector?.metaid !== metaid && showFollowButton && (
            <FollowButton
              isFollowed={(myFollowingListData?.list ?? []).includes(metaid)}
              isFollowingPending={
                (myFollowingList ?? []).includes(metaid ?? '') &&
                !(myFollowingListData?.list ?? []).includes(metaid)
              }
              isUnfollowingPending={
                !(myFollowingList ?? []).includes(metaid ?? '') &&
                (myFollowingListData?.list ?? []).includes(metaid)
              }
              handleFollow={handleFollow}
            />
          )}
        </div>
        <div
          className={cls('border-y  border-white p-4', {
            'cursor-pointer': !isNil(onBuzzDetail),
          })}
        >
          <div
            className='flex flex-col gap-2'
            onClick={() => onBuzzDetail && onBuzzDetail(buzzItem.id)}
          >
           
          </div>
          <div>
            {!attachData.pending &&
              !isEmpty(
                (attachData?.data ?? []).filter((d: any) => !isNil(d))
              ) &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderImages(attachPids)}
          </div>
          {!isEmpty(quotePinId) && (
            <div className='mb-8'>
              {isQuoteLoading ? (
                <div className='flex items-center gap-2 justify-center text-gray h-[150px]'>
                  <div>Loading repost content...</div>
                  <span className='loading loading-bars loading-md grid '></span>
                </div>
              ) : (
                <ForwardBuzzCard buzzItem={quoteDetailData} />
              )}
            </div>
          )}

          <div className='flex justify-between text-gray mt-2'>
            <div
              className='flex gap-2 items-center hover:text-slate-300 md:text-md text-xs'
              onClick={() => {
                window.open(
                  `https://mempool.space/${environment.network === 'mainnet' ? '' : 'testnet/'
                  }tx/${buzzItem.genesisTransaction}`,
                  '_blank'
                );
              }}
            >
              <LucideLink size={12} />
              <div>{buzzItem.genesisTransaction.slice(0, 8) + '...'}</div>
            </div>
            <div className='flex gap-2 md:text-md text-xs items-center'>
              {buzzItem?.number === -1 && (
                <div
                  className='tooltip tooltip-secondary mt-0.5'
                  data-tip='This buzz(PIN) is still in the mempool...'
                >
                  <span className='loading loading-ring loading-sm cursor-pointer'></span>
                </div>
              )}

              <div>
                {dayjs
                  .unix(buzzItem.timestamp)
                  .tz(dayjs.tz.guess())
                  .format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between pb-4 px-4'>
          <div className='flex gap-3 items-center'>
            <div className='flex gap-1 items-center'>
              <Heart
                className={cls(
                  { 'text-[red]': isLikeByCurrentUser },
                  'cursor-pointer'
                )}
                fill={isLikeByCurrentUser && 'red'}
                onClick={() => handleLike(buzzItem!.id)}
              />
              {!isNil(currentLikeData) ? currentLikeData.length : null}
            </div>
            <div className='flex gap-1 items-center cursor-pointer'>
              <Send
                onClick={async () => {
                  await checkMetaletInstalled();
                  await checkMetaletConnected(connected);
                  await checkUserNameExisted(userInfo?.name ?? '');

                  (document.getElementById(
                    'repost_buzz_modal_' + buzzItem.id
                  ) as HTMLDialogElement)!.showModal();
                }}
              />
            </div>
            <div className='flex gap-1 items-center cursor-pointer'>
              <MessageCircle
                onClick={async () => {
                  await checkMetaletInstalled();
                  await checkMetaletConnected(connected);
                  await checkUserNameExisted(userInfo?.name ?? '');

                  (document.getElementById(
                    'comment_buzz_modal_' + buzzItem.id
                  ) as HTMLDialogElement)!.showModal();
                }}
              />
              {!isNil(commentData?.data) ? commentData?.data.length : null}
            </div>
          </div>
          <div className='btn btn-sm rounded-full hidden'>Want To Buy</div>
        </div>
      </div>

      {/* <RepostModal quotePin={buzzItem} btcConnector={btcConnector!} />

      <CommentModal
        commentPin={buzzItem}
        commentToUser={currentUserInfoData?.data}
        btcConnector={btcConnector!}
      /> */}
    </>
  );
};

export default BuzzCard;
