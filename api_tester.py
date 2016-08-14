#!/usr/bin/env python3
#-*- coding: utf-8 -*-
#Copyright 2015 Dell.Inc

import urllib.request
import ssl
import json

# This restores the same behavior as before.


BASE_PATH = 'http://localhost:3000/__api__'

# START_LOGON = BASE_PATH + "/__api__"

class HTTPSender:

    def __init__(self):
        self.response = None
        self.request = None

    @classmethod
    def send(cls, url, values = None, method = 'GET', header={}):
        c = cls()
        data = None
        context = ssl._create_unverified_context()
        if values is not None:
            # data = urllib.parse.urlencode(values)
            # data = data.encode('utf-8') # data should be bytes           
            data = json.dumps(values)
            data = data.encode('utf-8')
        
        if data is None:
            c.request = urllib.request.Request(url)
        else:
            c.request = urllib.request.Request(url, data)
            c.request.add_header('Content-Type', 'application/json')
        for key, value in header.items():
            c.request.add_header(key,value)

        c.request.method = method
        # print(c.request.get_header('Content-Type'))
        try:
            c.response = urllib.request.urlopen(c.request, context=context)
        except urllib.error.HTTPError as e:
            # print(e)
            # Get the body even if it's on error.
            c.response = e

        return c
    
    @property
    def body(self):
        if self.response is None:
            return None
        return self.response.read().decode()

    @property
    def raw_body(self):
        if self.response is None:
            return None
        return self.response.read()

    @property
    def method(self):
        if self.request is None:
            return None
        
        return self.request.get_method()

    @property
    def headers(self):
        if self.response is None:
            return None
        return self.response.getheaders()

    def get_header_by_name(self, name):
        if self.response is None:
            return None
        return self.response.getheader(name, None)

if __name__ == '__main__':

    resp = HTTPSender.send(BASE_PATH + '/logon', values = {'username': 'abc', 'password' : 'abb'}, method = 'POST')
    print("RESPONSE: ", resp.body)
    session = resp.get_header_by_name('set-cookie')
    print("SESSION ", session)

    resp = HTTPSender.send(BASE_PATH + '/menu', 
                            values = {
                                        'vender' : 'guolan',
                                        'dish' : 'dish2'
                                    }, 
                            header={'cookie':session},
                            method = 'POST') 
    print("RESPONSE: ", resp.body)



    resp = HTTPSender.send(BASE_PATH + '/rule', 
                            values = {
                                        'menu' : 'guolan',
                                        'type' : 'lunch',
                                        'day' : 5
                                    }, 
                            header={'cookie':session},
                            method = 'POST') 
    print("RESPONSE: ", resp.body)

    resp = HTTPSender.send(BASE_PATH + '/rule', 
                            values = {
                                        'menu' : 'guolan',
                                        'type' : 'supper',
                                        'day' : 5
                                    }, 
                            header={'cookie':session},
                            method = 'POST') 
    print("RESPONSE: ", resp.body)

    resp = HTTPSender.send(BASE_PATH + '/rule', 
                            values = {
                                        'menu' : 'guolan',
                                        'type' : 'breakfast',
                                        'day' : 5
                                    }, 
                            header={'cookie':session},
                            method = 'POST') 
    print("RESPONSE: ", resp.body)

    resp = HTTPSender.send(BASE_PATH + '/rule',  header={'cookie':session}, method = 'GET') 
    print("RESPONSE: ", resp.body)

