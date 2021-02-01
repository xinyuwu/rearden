from caprotobackend.util import SECRET_KEY
import jwt
import sys, getopt
import datetime


def main(argv):
    permission = 'Read'
    expiry = 1
    try:
        opts, args = getopt.getopt(argv, "p:o:", ["permission=", "expiry="])
    except getopt.GetoptError:
        print('generate_token.py -p or --permission <Read/Write> -expiry <number of days>')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('generate_token.py -permission <Read/Write> -expiry <number of days>')
            sys.exit()
        elif opt in ("-p", "--permission"):
            permission = arg
        elif opt in ("-e", "--expiry"):
            expiry = int(arg)

    time_limit = datetime.datetime.utcnow() + datetime.timedelta(days=expiry)
    time_limit_epoch = (time_limit - datetime.datetime(1970,1,1)).total_seconds()
    token_payload = {
        "permission": permission,
        "expire": time_limit_epoch*1000
    }
    token = jwt.encode(token_payload, SECRET_KEY)

    print(token)


if __name__ == "__main__":
    main(sys.argv[1:])


